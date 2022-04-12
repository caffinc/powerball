import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NativeStackHeaderProps } from "@react-navigation/native-stack/lib/typescript/src/types";
import { useFonts } from "expo-font";
import * as React from "react";
import { Text, View } from "react-native";
import { DefaultTheme, Provider as PaperProvider } from "react-native-paper";
import DeviceListScreen from "./src/screens/DeviceListScreen";
import HomeScreen from "./src/screens/HomeScreen";
import StatusScreen from "./src/screens/StatusScreen";

export type RootStackParamList = {
  Home: undefined;
  DeviceList: { deviceIds: string[] };
  Status: { deviceId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function App() {
  const [isLoaded] = useFonts({
    "Stainless-Light": require("./assets/fonts/StainLig.ttf"),
    "Stainless-Bold": require("./assets/fonts/StainBol.ttf"),
    "Stainless-Regular": require("./assets/fonts/StainReg.ttf"),
  });

  const options = { headerTitleStyle: { fontFamily: "Stainless-Bold" } };

  function Header(props: NativeStackHeaderProps) {
    const title =
      typeof props.options.headerTitle === "string"
        ? props.options.headerTitle
        : props.options.headerTitle?.({});
    return (
      <View style={{ height: 100, backgroundColor: "white", elevation: 10 }}>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 30,
            paddingHorizontal: 30,
          }}
        >
          <Text
            style={{
              flex: 2,
              color: "gray",
              fontSize: 18,
              textTransform: "uppercase",
              fontWeight: "bold",
            }}
          >
            {title}
          </Text>
          {props.options.headerRight && props.options.headerRight({})}
        </View>
      </View>
    );
  }

  return (
    <PaperProvider theme={theme}>
      {isLoaded && (
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{ header: (props) => <Header {...props} /> }}
          >
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ headerTitle: "Searching for devices", ...options }}
            />
            <Stack.Screen
              name="DeviceList"
              component={DeviceListScreen}
              options={{ headerTitle: "Connect to a device", ...options }}
            />
            <Stack.Screen
              name="Status"
              component={StatusScreen}
              options={{
                headerTitleStyle: { fontFamily: "Stainless-Bold" },
                headerBackVisible: false,
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      )}
    </PaperProvider>
  );
}

export default App;

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#01b5e2",
    accent: "black",
  },
};
