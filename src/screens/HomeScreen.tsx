import { MaterialIcons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { State, Subscription } from "react-native-ble-plx";
import { Text } from "react-native-paper";
import Pulse from "react-native-pulse";
import styled from "styled-components";
import { RootStackParamList } from "../../App";
import BleManager from "../ble/manager";

const StyledBoldHeading = styled(Text)`
  font-family: "Stainless-Bold";
  font-size: 42px;
`;

const StyledNormalHeading = styled(Text)`
  font-family: "Stainless-Regular";
  font-size: 36px;
`;

const SubText = styled(Text)`
  font-family: "Stainless-Regular";
  margin-top: 8px;
  font-size: 24px;
  text-align: center;
  text-transform: uppercase;
`;

// #define SMARTC_SERVICE_UUID     "cb8a781f-6f1a-4158-a52e-ccdd8d35edc9"
// #define ID_DATA_UUID            "f3dc6104-75f0-4bd9-8b8a-953a64b86662"
// #define ELECTRICAL_DATA_UUID    "9e1d814e-7a74-438e-85b4-11a16b80b697"
// #define ELECTRICAL_STATUS_UUID  "093ec79a-6cec-4428-ab8d-4d9bc00aec86"
// #define THERMAL_DATA_UUID       "3ff59738-9156-4e9f-bff1-5c37f0c0bfdb"

const BLE_SERVICE_IDS = ["00001812-0000-1000-8000-00805f9b34fb"]; //, "cb8a781f-6f1a-4158-a52e-ccdd8d35edc9"];
const SCAN_TIMEOUT = 10000;

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

const HomeScreen = ({ navigation }: Props) => {
  const devices: string[] = [];
  const devicesRef = useRef(devices);

  const [bluetoothOn, setBluetoothOn] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | undefined>(
    undefined
  );
  const [subscription, setSubscription] = useState<Subscription | undefined>(
    undefined
  );
  const [count, setCount] = useState(0);

  const setPageState = useCallback(
    (state: State) => {
      console.log("State", state, bluetoothOn);
      if (state === State.PoweredOn) {
        setBluetoothOn(true);
      } else {
        setBluetoothOn(false);
      }
    },
    [bluetoothOn]
  );

  const cancelTimeout = useCallback(() => {
    console.log("Cancel timeout", timeoutId);
    timeoutId && clearTimeout(timeoutId);
  }, [timeoutId]);

  useEffect(() => {
    console.log("BT state change", bluetoothOn);
    cancelTimeout();
    if (bluetoothOn) {
      BleManager.startDeviceScan(BLE_SERVICE_IDS, null, (error, device) => {
        if (!error && device && device.id) {
          const deviceId = device.id;
          if (!devicesRef.current.includes(deviceId)) {
            console.log(
              device?.name,
              device?.localName,
              device?.id,
              device?.serviceUUIDs,
              device?.rssi
            );
            devicesRef.current.push(deviceId);
            setCount(devicesRef.current.length);
          }
        } else if (error) {
          console.log({ error });
        }
      });
      setTimeoutId(
        setTimeout(() => {
          navigation.replace("DeviceList", { deviceIds: devicesRef.current });
        }, SCAN_TIMEOUT)
      );
    } else {
      BleManager.stopDeviceScan();
      devicesRef.current = [];
    }
    return () => {
      console.log("Stopping scan");
      BleManager.stopDeviceScan();
    };
  }, [bluetoothOn]);

  useEffect(() => {
    const initBluetoothState = async () => {
      setPageState(await BleManager.state());
    };
    initBluetoothState();
    const sub = BleManager.onStateChange((state) => {
      setPageState(state);
    }, true);
    setSubscription(sub);
    return () => {
      console.log("Removing subscription");
      sub && sub.remove();
    };
  }, []);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      {bluetoothOn && (
        <View style={{ position: "absolute", top: 50, alignItems: "center" }}>
          <StyledNormalHeading>Searching</StyledNormalHeading>
          {count > 0 && (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <SubText>Found </SubText>
              <SubText style={{ fontWeight: "bold" }}>{count}</SubText>
              <SubText> device</SubText>
              {count != 1 && <SubText>s</SubText>}
            </View>
          )}
        </View>
      )}
      <View
        style={{
          padding: 10,
          marginVertical: 20,
        }}
      >
        {!bluetoothOn && (
          <MaterialIcons name="bluetooth-disabled" size={80} color="#aaaaaa" />
        )}

        {bluetoothOn && (
          <>
            <Pulse color="#01b5e2" />
            <MaterialIcons
              name="bluetooth"
              size={72}
              color="white"
              onPress={() => {
                cancelTimeout();
                navigation.replace("DeviceList", {
                  deviceIds: devicesRef.current,
                });
              }}
            />
          </>
        )}
      </View>
      {/* <ActivityIndicator size="large" animating={connState == 1} style={{ marginVertical: 20 }} /> */}
      {!bluetoothOn && (
        <>
          <StyledNormalHeading>Bluetooth is disabled.</StyledNormalHeading>

          <SubText>Enable Bluetooth to connect to Smart Controllers.</SubText>
        </>
      )}

      <StatusBar style="dark" translucent={true} />
    </View>
  );
};

export default HomeScreen;
