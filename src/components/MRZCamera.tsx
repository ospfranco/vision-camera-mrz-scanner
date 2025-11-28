import React, {
  FC,
  PropsWithChildren,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import {
  Camera,
  CameraPermissionStatus,
  useCameraDevice,
  useFrameProcessor,
} from 'react-native-vision-camera';
import { runOnJS, scheduleOnRN } from 'react-native-worklets';
import {
  MRZCameraProps,
  scanMRZ,
  sortFormatsByResolution,
} from 'VisionCameraMrzScanner';

const MRZCamera: FC<PropsWithChildren<MRZCameraProps>> = ({
  style,
  cameraProps,
  onData,
  scanSuccess,
}) => {
  //*****************************************************************************************
  //  setting up the state
  //*****************************************************************************************
  // Permissions
  const [hasPermission, setHasPermission] = useState(false);
  // camera states
  // const devices = useCameraDevices();
  const device = useCameraDevice('back');
  // const direction: 'front' | 'back' = cameraDirection ?? 'back';
  // const device =
  //   cameraProps?.device ?? devices.find((d) => d.position === direction);
  const { width: screenWidth } = useWindowDimensions();
  const [isActive, setIsActive] = useState(true);
  const [feedbackText, setFeedbackText] = useState<string>('');

  //*****************************************************************************************
  // Comp Logic
  //*****************************************************************************************

  // const xRatio = frame.width / WINDOW_WIDTH;
  // const yRatio = frame.height / WINDOW_HEIGHT;
  /* A cleanup function that is called when the component is unmounted. */
  useEffect(() => {
    return () => {
      setIsActive(false);
    };
  }, []);

  // which format should we use
  const formats = useMemo(
    () => device?.formats.sort(sortFormatsByResolution),
    [device?.formats]
  );

  //figure our what happens if it is undefined?
  const [format, setFormat] = useState(
    formats && formats.length > 0 ? formats[0] : undefined
  );

  useEffect(() => {
    setFormat(formats && formats.length > 0 ? formats[0] : undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device]);

  // const handleScanFunc = Worklets.createRunOnJS(handleScan);

  /* Using the useFrameProcessor hook to process the video frames. */
  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    scheduleOnRN(() => {
      setFeedbackText('WHAT');
    });
    // if (!scanSuccess) {
    //   const data = scanMRZ(frame);

    //   if (!data) {
    //     return;
    //   }

    //   if (
    //     data.result &&
    //     data.result.blocks &&
    //     data.result.blocks.length === 0
    //   ) {
    //     scheduleOnRN(setFeedbackText, 'align');
    //   }
    //   /* Scanning the text from the image and then setting the state of the component. */

    //   if (data.result && data.result.blocks && data.result.blocks.length > 0) {
    //     // let updatedOCRElements: BoundingFrame[] = [];
    //     data.result.blocks.forEach((block) => {
    //       if (block.frame.width / screenWidth < 0.8) {
    //         scheduleOnRN(setFeedbackText, 'Hold still');
    //       } else {
    //         scheduleOnRN(setFeedbackText, 'scanning... ');
    //       }
    //       // updatedOCRElements.push({ ...block.frame });
    //     });

    //     let lines: string[] = [];
    //     data.result.blocks.forEach((block) => {
    //       lines.push(block.text);
    //     });

    //     // if (lines.length > 0 && isActive && onData) {
    //     //   // runOnJS(() => {
    //     //   //   onData(lines);
    //     //   // });
    //     //   scheduleOnRN(onData, lines);
    //     // }
    //   }
    // }
  }, []);

  useEffect(() => {
    (async () => {
      const status: CameraPermissionStatus =
        await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');
    })();
  }, []);

  //*****************************************************************************************
  // stylesheet
  //*****************************************************************************************

  //*****************************************************************************************
  // Components
  //*****************************************************************************************

  return (
    <View style={style}>
      {device && hasPermission ? (
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          torch={cameraProps?.torch}
          isActive
          // photo={cameraProps?.photo}
          // video={cameraProps?.video}
          // audio={cameraProps?.audio}
          // zoom={cameraProps?.zoom}
          // enableZoomGesture={cameraProps?.enableZoomGesture}
          fps={30}
          format={cameraProps?.format ?? format}
          // fps={cameraProps?.fps ?? 10}
          // lowLightBoost={cameraProps?.lowLightBoost}
          // videoStabilizationMode={cameraProps?.videoStabilizationMode}
          // enableDepthData={cameraProps?.enableDepthData}
          // enablePortraitEffectsMatteDelivery={
          //   cameraProps?.enablePortraitEffectsMatteDelivery
          // }
          // onError={cameraProps?.onError}
          // onInitialized={cameraProps?.onInitialized}
          frameProcessor={frameProcessor}
        />
      ) : undefined}

      {/* {photoSkipButton ? (
        <View style={[styles.fixToText]}>
          {photoSkipButtonEnabled ? (
            photoSkipButton ? (
              <TouchableOpacity onPress={photoSkipOnPress}>
                {photoSkipButton}
              </TouchableOpacity>
            ) : (
              <View style={[styles.skipButtonContainer, photoSkipButtonStyle]}>
                <Button
                  title={skipButtonText ? skipButtonText : 'Skip'}
                  onPress={photoSkipOnPress}
                />
              </View>
            )
          ) : undefined}
        </View>
      ) : undefined} */}
      <View style={styles.feedbackContainer}>
        <Text style={styles.feedbackText}>{feedbackText}</Text>
      </View>
    </View>
  );
};

export default MRZCamera;

const styles = StyleSheet.create({
  fixToText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  skipButtonContainer: {
    position: 'absolute',
    bottom: 20,
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  feedbackContainer: {
    position: 'absolute',
    top: 300,
    width: 800,
    height: 40,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  feedbackText: {
    color: 'black',
    fontSize: 18,
    textAlign: 'center',
  },
});
