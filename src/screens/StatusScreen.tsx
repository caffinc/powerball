import { NativeStackScreenProps } from "@react-navigation/native-stack";
import base64 from "base-64";
import { StatusBar } from "expo-status-bar";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Dimensions, ScrollView, View } from "react-native";
import { Device, Subscription } from "react-native-ble-plx";
import { ProgressChart } from "react-native-chart-kit";
import { AbstractChartConfig } from "react-native-chart-kit/dist/AbstractChart";
import { Button, Card, Text } from "react-native-paper";
import styled from "styled-components";
import { RootStackParamList } from "../../App";
import BleManager from "../ble/manager";
import ProgressBar from "../components/progress-bar.component";
import AsyncStorage from "@react-native-async-storage/async-storage";

const screenWidth = Dimensions.get("window").width;

const StyledBoldHeading = styled(Text)`
    fontFamily: 'Stainless-Bold'
    fontSize: 42px
`;

const StyledNormalHeading = styled(Text)`
    fontFamily: 'Stainless-Regular'
    fontSize: 42px
`;

const StyledTitle = styled(Text)`
    fontFamily: "Stainless-Bold"
    fontSize: 23px
`;

const StyledHeading = styled(Text)`
  font-family: "Stainless-Bold";
  font-size: 23px;
  align-self: flex-start;
`;

const StyledContent = styled(Text)`
  font-family: "Stainless-Regular";
  font-size: 23px;
  align-self: flex-start;
`;

const DataSection = styled(View)`
  align-content: flex-start;
  align-self: flex-start;
  width: 100%;
  margin-vertical: 10px;
  padding-horizontal: 20px;
`;

const DataRow = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 4px;
`;

const Bar = styled(View)`
  flex: 1;
  margin: 10px;
  width: 90%;
  border-bottom-color: #aaaaaa;
  border-bottom-width: 1px;
`;

type Props = NativeStackScreenProps<RootStackParamList, "Status">;

type RunInfo = {
  deviceId: string;
  v1: number;
  rpm: number;
  rpmWindow: number[];
  maxRpm: number;
  duration: number;
  rotation: number;
};

const calculateStrength = (rpm: number): number => {
  const x = rpm / 1000;
  return Math.max(0, 0.2 * x * x + 0.3 * x - 1);
};

const infoSection = (runInfo: RunInfo) => (
  <DataSection>
    <DataRow>
      <StyledHeading>Device ID</StyledHeading>
      <StyledContent>{runInfo ? runInfo.deviceId : " "}</StyledContent>
    </DataRow>
  </DataSection>
);

const timeSection = (runInfo: RunInfo) => (
  <DataSection style={{ display: "flex", justifyContent: "center" }}>
    <ProgressChart
      data={{
        data: [runInfo.rotation / 4000, runInfo.duration / 1200],
        labels: [
          `${(runInfo.rotation / 10).toFixed(0)}r`,
          `${(runInfo.duration / 10).toFixed(0)}s`,
        ],
      }}
      width={200}
      height={120}
      strokeWidth={10}
      radius={30}
      chartConfig={chartConfig}
      hideLegend={false}
      xAxisLabel=""
      style={{ flex: 1 }}
    />
  </DataSection>
);

const speedSection = (runInfo: RunInfo) => (
  <DataSection>
    <DataRow>
      <StyledHeading>RPM</StyledHeading>
      <StyledContent>{runInfo.rpm}</StyledContent>
    </DataRow>
    <DataRow>
      <StyledHeading>Max RPM</StyledHeading>
      <StyledContent>{runInfo.maxRpm}</StyledContent>
    </DataRow>
    <DataRow>
      <StyledHeading>Average RPM</StyledHeading>
      <StyledContent>
        {(
          avg(runInfo.rpmWindow)
        ).toFixed(0)}
      </StyledContent>
    </DataRow>
  </DataSection>
);

const strengthSection = (runInfo: RunInfo) => (
  <DataSection>
    <DataRow>
      <StyledHeading>Current Strength</StyledHeading>
      <StyledContent>
        {calculateStrength(runInfo.rpm).toFixed(2)}KG
      </StyledContent>
    </DataRow>
    <DataRow>
      <StyledHeading>Max Strength</StyledHeading>
      <StyledContent>
        {calculateStrength(runInfo.maxRpm).toFixed(2)}KG
      </StyledContent>
    </DataRow>
    <ProgressBar
      bgcolor={"#01b5e2"}
      completed={18 + (82 * calculateStrength(runInfo.rpm)) / 90}
      maxCompleted={18 + (82 * calculateStrength(runInfo.maxRpm)) / 90}
      label={calculateStrength(runInfo.rpm).toFixed(2)}
      maxLabel={calculateStrength(runInfo.maxRpm).toFixed(2)}
      fullLabel={"90.00"}
    />
  </DataSection>
);

const recordEntry = (r: RunInfo) => (
  <>
    <DataRow>
      <StyledHeading style={{ width: "50%" }}>Avg. RPM/Str.</StyledHeading>
      <StyledContent>{avg(r.rpmWindow).toFixed(0)}</StyledContent>
      <StyledContent>
        {calculateStrength(avg(r.rpmWindow)).toFixed(2)}
      </StyledContent>
    </DataRow>
    <DataRow>
      <StyledHeading style={{ width: "50%" }}>Max. RPM/Str.</StyledHeading>
      <StyledContent>{r.maxRpm}</StyledContent>
      <StyledContent>{calculateStrength(r.maxRpm).toFixed(2)}</StyledContent>
    </DataRow>
    <DataRow>
      <StyledHeading style={{ width: "50%" }}>Dura/Rot</StyledHeading>
      <StyledContent>{r.duration / 10}s</StyledContent>
      <StyledContent>{r.rotation / 10}r</StyledContent>
    </DataRow>
  </>
);

const recordSection = (lastRun?: RunInfo, records: RunInfo[]) => (
  <DataSection>
    {lastRun && (
      <>
        <StyledHeading>Last Run</StyledHeading>
        {recordEntry(lastRun)}
      </>
    )}
    {records.map((r, i) => (
      <View key={`rec_${i}`}>
        {(i > 0 || lastRun) && <Bar />}
        <StyledHeading>Record {i + 1}</StyledHeading>
        {recordEntry(r)}
      </View>
    ))}
  </DataSection>
);

const loadingText = () => {
  <Text style={{ fontFamily: "Stainless-Regular", fontSize: 42 }}>
    Connecting...
  </Text>;
};

const storeRecords = async (records: RunInfo[]) => {
  try {
    const jsonValue = JSON.stringify(records);
    await AsyncStorage.setItem("records", jsonValue);
  } catch (e) {
    console.log("Unable to store records", e);
  }
};

const loadRecords = async (): Promise<RunInfo[]> => {
  try {
    const res = await AsyncStorage.getItem("records");
    if (res) {
      return JSON.parse(res) as RunInfo[];
    }
  } catch (e) {
    console.log("Unable to store records", e);
  }
  return [];
};

const avg = (vs: number[]): number => vs.reduce((p, v) => p + v) / vs.length;

const addRecord = (records: RunInfo[], newRecord: RunInfo): RunInfo[] => {
  return [...records, newRecord]
    .sort((r1, r2) => avg(r2.rpmWindow) - avg(r1.rpmWindow))
    .slice(0, 10);
};

const StatusScreen = ({ route, navigation }: Props) => {
  const deviceId = route.params.deviceId;

  const [device, setDevice] = useState<Device | undefined>(undefined);
  const [runInfo, setRunInfo] = useState<RunInfo | undefined>(undefined);
  const [lastRunInfo, setLastRunInfo] = useState<RunInfo | undefined>(
    undefined
  );
  const [records, setRecords] = useState<RunInfo[]>([]);
  const subscriptions = useRef<Subscription[]>([]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => <StyledTitle>{device ? device.name : ""}</StyledTitle>,
      headerRight: () => (
        <Button onPress={disconnect} mode={"text"} dark={false}>
          <Text style={{ fontFamily: "Stainless-Regular", color: "#262626" }}>
            Disconnect
          </Text>
        </Button>
      ),
    });
  }, [navigation, device]);

  useEffect(() => {
    loadRecords().then((r) => setRecords(r));
    const connect = async () => {
      console.log("Connecting to", deviceId);
      const newDevice = await (
        await BleManager.connectToDevice(deviceId)
      ).discoverAllServicesAndCharacteristics();
      console.log("Device set!", newDevice.id, await newDevice.isConnected());
      setDevice(newDevice);

      newDevice.onDisconnected((err, dev) => {
        disconnect();
      })
      const subs: Subscription[] = [];
      // ID Data
      subs.push(
        newDevice.monitorCharacteristicForService(
          "0000ffe0-0000-1000-8000-00805f9b34fb",
          "0000ffe1-0000-1000-8000-00805f9b34fb",
          (error, characteristic) => {
            if (!error && characteristic) {
              const v = characteristic.value;
              const decodedValue = [
                ...base64.decode(characteristic.value || ""),
              ]
                .slice(4, 11)
                .map((c) => {
                  return c.charCodeAt(0);
                });
              console.log("Data 1: ", decodedValue.join("\t"));
              const v1 = decodedValue[2];
              const rpm = decodedValue[1] * 256 + decodedValue[0];
              const duration = decodedValue[4] * 256 + decodedValue[3];
              const rotation = decodedValue[6] * 256 + decodedValue[5];
              setRunInfo((runInfo) => {
                if (!runInfo) {
                  return {
                    deviceId: newDevice.id,
                    v1,
                    rpm,
                    rpmWindow: [rpm],
                    maxRpm: rpm,
                    duration,
                    rotation,
                  };
                }
                if (duration < runInfo.duration) {
                  setRecords((records) => {
                    setLastRunInfo(runInfo);
                    const newRecords = addRecord(records, runInfo);
                    storeRecords(newRecords);
                    return newRecords;
                  });
                  console.log("Creating a new run");
                  return {
                    deviceId: newDevice.id,
                    v1,
                    rpm,
                    rpmWindow: [rpm],
                    maxRpm: rpm,
                    duration,
                    rotation,
                  };
                }
                return {
                  deviceId: runInfo.deviceId,
                  v1,
                  rpm,
                  rpmWindow:
                    runInfo.rpmWindow.length < 60
                      ? [...runInfo.rpmWindow, rpm]
                      : [...runInfo.rpmWindow.slice(1), rpm],
                  maxRpm: Math.max(runInfo.maxRpm, rpm),
                  duration,
                  rotation,
                };
              });
            } else {
              console.log(error);
            }
          }
        )
      );

      subscriptions.current = subs;
    };
    connect();
  }, []);

  const disconnect = useCallback(async () => {
    if (device) {
      console.log("Disconnecting", deviceId);

      subscriptions.current.forEach((subscription) => subscription.remove());

      if (await device.isConnected()) {
        await device.cancelConnection().then((v) => {
          console.log(v.name, v.isConnected);
        });
      }
    }
    navigation.replace("Home");
  }, [device]);

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ alignItems: "center", justifyContent: "center" }}
    >
      {!device && loadingText()}
      {device && (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 20,
          }}
        >
          <Card
            style={{
              width: screenWidth - 60,
            }}
          >
            <View
              style={{
                padding: 10,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
              }}
            >
              {runInfo && (
                <>
                  {infoSection(runInfo)}
                  <Bar />
                  {speedSection(runInfo)}
                  <Bar />
                  {timeSection(runInfo)}
                  <Bar />
                  {strengthSection(runInfo)}
                  <Bar />
                  {recordSection(lastRunInfo, records)}
                </>
              )}
            </View>
          </Card>
        </View>
      )}
      <StatusBar style="dark" translucent={true} />
    </ScrollView>
  );
};

const chartConfig: AbstractChartConfig = {
  backgroundGradientFrom: "#ffffff",
  backgroundGradientFromOpacity: 0,
  backgroundGradientTo: "#ffffff",
  backgroundGradientToOpacity: 0,
  color: (opacity = 1) => `rgba(1, 181, 226, ${opacity * 2})`,
  strokeWidth: 20, // optional, default 3
  propsForBackgroundLines: {
    strokeDasharray: "",
    stroke: "#aaaaaa",
  },
  useShadowColorFromDataset: false, // optional
  labelColor: (_) => `rgba(0, 0, 0, 255)`,
  propsForLabels: {
    fontFamily: "Stainless-Regular",
  },
  //strokeDashArray: ""
};

export default StatusScreen;
