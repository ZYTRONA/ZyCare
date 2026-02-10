import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Phone, PhoneOff, Mic, MicOff, Video as VideoIcon, VideoOff } from 'lucide-react-native';
// import ZegoUIKitPrebuiltCall from '@zegocloud/zego-uikit-prebuilt-call-rn';

export default function VideoCall({ route, navigation }) {
  const { ticketId, patientName, aiSummary } = route.params;
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const handleEndCall = () => {
    Alert.alert(
      'End Call',
      'Are you sure you want to end this consultation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Call',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-gray-900">
      {/* Video Container */}
      <View className="flex-1 items-center justify-center">
        {/* Placeholder for ZegoCloud Video */}
        <View className="w-full h-full bg-gray-800 items-center justify-center">
          <Text className="text-white text-xl mb-2">Video Call Active</Text>
          <Text className="text-gray-400">{patientName}</Text>
          <Text className="text-gray-500 text-sm mt-4 px-8 text-center">
            Integrate ZegoCloud SDK here
          </Text>
        </View>
      </View>

      {/* AI Summary Overlay */}
      <View className="absolute top-16 right-4 bg-blue-500 bg-opacity-90 rounded-2xl p-4 max-w-[60%]">
        <Text className="text-white font-bold mb-2">AI Patient Summary</Text>
        <Text className="text-white text-sm">{aiSummary}</Text>
      </View>

      {/* Controls */}
      <View className="absolute bottom-8 left-0 right-0 flex-row justify-center items-center">
        {/* Mute */}
        <TouchableOpacity
          className={`mx-3 w-14 h-14 rounded-full items-center justify-center ${
            isMuted ? 'bg-red-500' : 'bg-gray-700'
          }`}
          onPress={() => setIsMuted(!isMuted)}
        >
          {isMuted ? <MicOff size={24} color="white" /> : <Mic size={24} color="white" />}
        </TouchableOpacity>

        {/* End Call */}
        <TouchableOpacity
          className="mx-3 w-16 h-16 rounded-full bg-red-600 items-center justify-center"
          onPress={handleEndCall}
        >
          <PhoneOff size={28} color="white" />
        </TouchableOpacity>

        {/* Video Toggle */}
        <TouchableOpacity
          className={`mx-3 w-14 h-14 rounded-full items-center justify-center ${
            isVideoOff ? 'bg-red-500' : 'bg-gray-700'
          }`}
          onPress={() => setIsVideoOff(!isVideoOff)}
        >
          {isVideoOff ? (
            <VideoOff size={24} color="white" />
          ) : (
            <VideoIcon size={24} color="white" />
          )}
        </TouchableOpacity>
      </View>

      {/* Call Duration */}
      <View className="absolute top-16 left-4 bg-black bg-opacity-50 rounded-lg px-3 py-2">
        <Text className="text-white font-mono">00:00</Text>
      </View>
    </View>
  );
}

// ZegoCloud Integration Example (commented out until credentials are added):
/*
export default function VideoCall({ route, navigation }) {
  const { ticketId } = route.params;
  
  return (
    <View className="flex-1">
      <ZegoUIKitPrebuiltCall
        appID={parseInt(process.env.EXPO_PUBLIC_ZEGO_APP_ID)}
        appSign={process.env.EXPO_PUBLIC_ZEGO_APP_SIGN}
        userID={ticketId}
        userName="Doctor"
        callID={ticketId}
        config={{
          onCallEnd: () => navigation.goBack(),
        }}
      />
    </View>
  );
}
*/
