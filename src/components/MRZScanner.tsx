import React, { FC, PropsWithChildren, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { MRZCamera, MRZScannerProps } from 'VisionCameraMrzScanner';
import type { MRZProperties } from '../types/mrzProperties';
import { parseMRZ } from '../util/mrzParser';

const idList: string[] = [];
const dobList: string[] = [];
const expiryList: string[] = [];

const MRZScanner: FC<PropsWithChildren<MRZScannerProps>> = ({
  style,
  skipButtonEnabled,
  skipButton,
  onSkipPressed,
  skipButtonStyle,
  skipButtonText,
  mrzFinalResults,
  numberOfQAChecks,
  isActiveCamera,
}) => {
  //*****************************************************************************************
  //  setting up the state
  //*****************************************************************************************

  const numQAChecks = numberOfQAChecks ?? 3;
  const [scanSuccess, setScanSuccess] = useState(false);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    return () => {
      setIsActive(false);
    };
  }, []);

  /**
   * If all elements in list match element, add the new element.
   * If not, empty the list, then add the new element to the list.
   * @param list
   * @param element
   */
  const mrzQACheck = (list: string[], element: string) => {
    for (let i = 0; i < list.length; i++) {
      if (list[i] !== element) {
        list = [];
      }
    }
    list.push(element);
  };

  /**
   * Returns true if all QALists are full (their sizes are >= numberOfPreviousMRZsToCompareTo).
   * If one or more of them are not full, it updates them with the most recently captured field that pertains to them.
   * @param numberOfPreviousMRZsToCompareTo
   * @param mrzResults
   */
  const currentMRZMatchesPreviousMRZs = (mrzResults: MRZProperties) => {
    if (
      // docMRZQAList.length >= nu &&
      idList.length >= numQAChecks &&
      dobList.length >= numQAChecks &&
      expiryList.length >= numQAChecks
    ) {
      return true;
    }

    console.log(`🟥 ${JSON.stringify(mrzResults)}`);

    if (mrzResults.idNumber && idList.length < numQAChecks) {
      mrzQACheck(idList, mrzResults.idNumber);
    }

    if (mrzResults.dob && dobList.length < numQAChecks) {
      mrzQACheck(dobList, mrzResults.dob);
    }
    if (mrzResults.docExpirationDate && expiryList.length < numQAChecks) {
      mrzQACheck(expiryList, mrzResults.docExpirationDate);
    }

    return false;
  };

  return (
    <View testID="scanDocumentView" style={StyleSheet.absoluteFill}>
      <MRZCamera
        onData={(lines) => {
          const mrzResults = parseMRZ(lines);
          if (mrzResults) {
            if (currentMRZMatchesPreviousMRZs(mrzResults)) {
              setScanSuccess(true);
              setIsActive(false);
              mrzFinalResults(mrzResults);
            }
          }
        }}
        scanSuccess={scanSuccess}
        skipButtonText={skipButtonText}
        style={[style ? style : StyleSheet.absoluteFill]}
        skipButtonEnabled={skipButtonEnabled}
        skipButtonStyle={skipButtonStyle}
        skipButton={skipButton}
        onSkipPressed={onSkipPressed}
        isActiveCamera={isActiveCamera ?? isActive} // if isActiveCamera is not defined, use the internal state
      />
    </View>
  );
};

export default MRZScanner;
