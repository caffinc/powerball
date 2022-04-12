import { MaterialIcons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { View } from "react-native";
import { Device } from "react-native-ble-plx";
import { ScrollView } from "react-native-gesture-handler";
import { Button, Card, Text } from "react-native-paper";
import styled from "styled-components";
import { RootStackParamList } from "../../App";
import BleManager from "../ble/manager";

const StyledButton = styled(Button)`
  width: 360px;
  marginTop: 24px;
`;
const StyledBoldHeading = styled(Text)`
    fontFamily: 'Stainless-Bold'
    fontSize: 42px
`;

const StyledNormalHeading = styled(Text)`
    fontFamily: 'Stainless-Regular'
    fontSize: 42px
`;

type Props = NativeStackScreenProps<RootStackParamList, "DeviceList">;

const DeviceListScreen = ({ route, navigation }: Props) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const { deviceIds } = route.params;
  useEffect(() => {
    BleManager.devices(deviceIds).then((scannedDevices) => {
      if (scannedDevices.length == 1) {
        connect(scannedDevices[0]);
      } else {
        setDevices(scannedDevices);
      }
    });
  }, []);

  const connect = (device: Device) => {
    navigation.replace("Status", { deviceId: device.id });
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          onPress={() => navigation.replace("Home")}
          mode={"contained"}
          dark={true}
        >
          <Text style={{ fontFamily: "Stainless-Regular", color: "white" }}>
            Rescan
          </Text>
        </Button>
      ),
    });
  }, [navigation]);

  return (
    <>
      {devices.length == 0 && (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <Text style={{ fontFamily: "Stainless-Regular", fontSize: 36 }}>
            No devices found.
          </Text>
          <Text style={{ fontSize: 24, textAlign: "center" }}>
            Enable Bluetooth to connect to Smart Controllers.
          </Text>
          <StyledButton
            onPress={() => navigation.replace("Home")}
            mode={"contained"}
            dark={true}
          >
            <Text
              style={{
                fontFamily: "Stainless-Light",
                color: "white",
                fontSize: 24,
              }}
            >
              Search again
            </Text>
          </StyledButton>
        </View>
      )}
      {devices.length > 0 && (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
          {devices.map((device) => (
            <Card
              key={device.id}
              style={{ padding: 20, marginTop: 10, marginHorizontal: 10 }}
            >
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flex: 2, flexDirection: "column" }}>
                  <Text style={{ fontFamily: "Stainless-Bold", fontSize: 25 }}>
                    {device.name}
                  </Text>
                  <Text style={{ fontFamily: "Stainless-Light", fontSize: 15 }}>
                    {device.id}
                  </Text>
                  <View
                    style={{
                      justifyContent: "flex-start",
                      flexDirection: "row",
                    }}
                  >
                    <MaterialIcons
                      name="signal-cellular-alt"
                      size={15}
                      color="black"
                      style={{ alignSelf: "flex-end" }}
                    />
                    <Text style={{ alignSelf: "flex-end" }}>
                      {" "}
                      {device.isConnectable} dB
                    </Text>
                  </View>
                </View>
                <Button
                  onPress={() => connect(device)}
                  mode={"contained"}
                  dark={true}
                  style={{
                    flex: 0.5,
                    height: 50,
                    justifyContent: "center",
                    alignSelf: "center",
                  }}
                >
                  <Text
                    style={{ fontFamily: "Stainless-Bold", color: "white" }}
                  >
                    Connect
                  </Text>
                </Button>
              </View>
            </Card>
          ))}
        </ScrollView>
      )}
      <StatusBar style="dark" translucent={true} />
    </>
  );
};

export default DeviceListScreen;
