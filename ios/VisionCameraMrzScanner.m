#import <Foundation/Foundation.h>
#import <VisionCamera/FrameProcessorPlugin.h>
#import <VisionCamera/FrameProcessorPluginRegistry.h>

#import "VisionCameraMrzScanner-Swift.h"


@interface VisionCameraMrzScanner (FrameProcessorPluginLoader)
@end

@implementation VisionCameraMrzScanner (FrameProcessorPluginLoader)

+ (void)load {
  // vision @4.x.x
  [FrameProcessorPluginRegistry
      addFrameProcessorPlugin:@"scanMRZPlugin"
              withInitializer:^FrameProcessorPlugin *_Nonnull(
                  VisionCameraProxyHolder *_Nonnull proxy,
                  NSDictionary *_Nullable options) {
                return [[VisionCameraMrzScanner alloc] initWithProxy:proxy
                                                         withOptions:options];
              }];
}

@end
