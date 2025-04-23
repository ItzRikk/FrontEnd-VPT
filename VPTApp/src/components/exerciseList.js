import { supabase } from "../api/supabaseClient"; // Import client




  export const fetchExercises = async () => {
    const { data, error } = await supabase.from("exercise").select(`*,
        exerciseEquipment(
        equipment(
        *)
        )
        `
    ); //selects all from usersTable in database
    if (error) {
      console.error("Error fetching exercises:", error); //if it fails you will get an error
      return [];
    } 
    return data;
  };