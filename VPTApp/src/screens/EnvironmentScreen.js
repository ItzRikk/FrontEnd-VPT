import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

const environments = ["Gym", "Outdoors", "Home", "Office"];

const EnvironmentScreen = () => {
  const navigation = useNavigation();

  const handlePress = (env) => {
    navigation.navigate("Workout", { environment: env.toLowerCase() }); 
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Your Environment</Text>
      {environments.map((env) => (
        <TouchableOpacity
          key={env}
          style={styles.button}
          onPress={() => handlePress(env)}
        >
          <Text style={styles.buttonText}>{env}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default EnvironmentScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 40,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#4A90E2",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginVertical: 10,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
  },
});