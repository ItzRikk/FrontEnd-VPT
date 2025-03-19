//currently nothing calls this but this is how to query the database


import React, { useEffect, useState } from "react";
import { View, Text, FlatList } from "react-native";
import { supabase } from "../api/supabaseClient"; // Import client

const usersList = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase.from("usersTable").select("*"); //selects all from usersTable in database
    if (error) {
      console.error("Error fetching users:", error); //if it fails you will get an error
    } else {
      console.log("Users List:", data); //this just prints the data for checking purposes
      setUsers(data);
    }
  };

  return (
    <View>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Text>{item.name} - {item.username}</Text>
        )}
      />
    </View>
  );
};

export default usersList;
