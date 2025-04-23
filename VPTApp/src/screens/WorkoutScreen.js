import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { fetchExercises } from "../components/exerciseList"; 
import { supabase } from "../api/supabaseClient";
import { useRoute } from "@react-navigation/native";

const WorkoutScreen = () => {
  const route = useRoute();
  const { environment } = route.params;
  console.log(environment);
  const [exerciseList, setExerciseList] = useState([]);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCurrentUserEquip = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          console.error("Session error:", sessionError || "No session");
          return;
        }

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          console.error("Error getting user:", userError);
          return;
        }
        setUser(user);
        const { data: profile, error: levelError } = await supabase
            .from("userProfile")
            .select("*")
            .eq("user_id", user.id)
            .single();
        if (levelError || !profile) {
          console.error("Error fetching profile:", levelError);
        } else {
          setProfile(profile);
        }

        const { data: equipmentData, error: equipError } = await supabase
          .from("userEnvironmentEquipment")
          .select("equipment_id")
          .eq("user_id", user.id);

        if (equipError) {
          console.error("Error fetching equipment:", equipError);
        } else {
          const equipmentIds = equipmentData.map(item => item.equipment_id);
          setEquipmentList(equipmentIds);
        }
      } catch (error) {
        console.error("Error in getCurrentUserEquip:", error);
      } finally {
        setLoading(false);
      }
    };

    getCurrentUserEquip();
  }, []);

  useEffect(() => {
    const loadExercises = async () => {
      const exercises = await fetchExercises();
      setExerciseList(exercises);
    };

    loadExercises();
  }, []);

  if (loading || !profile || !equipmentList.length) {
    return (
      <View>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading workout...</Text>
      </View>
    );
  }

  const uniqueCategories = [...new Set(exerciseList.map((e) => e.type))];
  const generateExercises = (exerciseList) => {
    return uniqueCategories.map((category) => {
      const filtered = exerciseList.filter((exercise) => {
        if (exercise.type !== category) return false;

        const userLevel = profile?.level || "Novice"; 

        if (exercise.level !== userLevel) return false;

        const requiredEquipment = exercise.exerciseEquipment;
        if (!requiredEquipment || requiredEquipment.length === 0) return true;

        return requiredEquipment.every((item) =>
          equipmentList.includes(item?.equipment?.id)
        );
      });

      if (filtered.length > 0) {
        const randomIndex = Math.floor(Math.random() * filtered.length);
        return filtered[randomIndex];
      }
      return null;
    }).filter(Boolean);
  };
  const workout = generateExercises(exerciseList);
  console.log("workout", workout);

  const totalTimeInSeconds = workout.reduce((total, exercise) => {
    return total + (exercise.duration || 0) + (exercise.rest || 0);
  }, 0);
  const totalTimeInMinutes = Math.floor(totalTimeInSeconds / 60);
  const totalTimeInRemainingSeconds = totalTimeInSeconds % 60;

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 10 }}>Total Workout Time:</Text>
      <Text>{totalTimeInMinutes} minutes {totalTimeInRemainingSeconds} seconds</Text>

      {workout.map((exercise, index) => (
        <View key={exercise.id || index} style={{ marginVertical: 10 }}>
          <Text style={{ fontWeight: "bold", fontSize: 16 }}>{exercise.name}</Text>
          <Text>
            {`Sets: ${exercise.sets} | Reps: ${exercise.reps} | Duration: ${exercise.duration} sec | Rest: ${exercise.rest} sec | Target Rpe: ${exercise.target_rpe_min}-${exercise.target_rpe_max} `}
          </Text>
          {exercise.instruction && <Text style={{ fontStyle: "italic" }}>Instructions: {exercise.instruction}</Text>}
        </View>
      ))}
    </View>
  );
};

export default WorkoutScreen;

