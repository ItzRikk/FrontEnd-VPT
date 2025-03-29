import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../config/supabase';

const TABLES = [
  { id: 'userProfile', name: 'User Profiles', key: 'user_id' },
  { id: 'exercise', name: 'Exercises', key: 'id' },
  { id: 'equipment', name: 'Equipment', key: 'id' },
  { id: 'exercise_type', name: 'Exercise Types', key: 'id' },
  { id: 'level', name: 'Experience Levels', key: 'level' }
];

const DatabaseViewerScreen = ({ navigation }) => {
  const [selectedTable, setSelectedTable] = useState(TABLES[0]);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchTableData = async (table) => {
    try {
      setLoading(true);
      setError(null);
      let query = supabase
        .from(table.id)
        .select('*');

      // For userProfile, just get the basic data
      if (table.id === 'userProfile') {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;
      
      setTableData(data || []);
    } catch (err) {
      console.error(`Error fetching ${table.name} data:`, err);
      setError(`Failed to load ${table.name} data: ${err.message}`);
      setTableData([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (selectedTable) {
      fetchTableData(selectedTable);
    }
  }, [selectedTable]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTableData(selectedTable);
  };

  const renderTableSelector = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.tableSelector}
    >
      {TABLES.map((table) => (
        <TouchableOpacity
          key={table.id}
          style={[
            styles.tableButton,
            selectedTable.id === table.id ? styles.selectedTableButton : null,
          ]}
          onPress={() => setSelectedTable(table)}
        >
          <Text 
            style={[
              styles.tableButtonText,
              selectedTable.id === table.id ? styles.selectedTableButtonText : null,
            ]}
          >
            {table.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderTableData = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => fetchTableData(selectedTable)}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (tableData.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No data found in {selectedTable.name}</Text>
        </View>
      );
    }

    // Extract all unique keys from the data
    const allKeys = Array.from(
      new Set(
        tableData.flatMap(item => Object.keys(item))
      )
    );

    return (
      <FlatList
        data={tableData}
        keyExtractor={(item, index) => 
          item[selectedTable.key]?.toString() || `item-${index}`
        }
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
          />
        }
        ListHeaderComponent={() => (
          <View style={styles.headerRow}>
            {allKeys.map(key => (
              <Text key={key} style={styles.headerCell}>
                {key}
              </Text>
            ))}
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.dataRow}>
            {allKeys.map(key => (
              <Text 
                key={key} 
                style={styles.dataCell}
                numberOfLines={2}
              >
                {item[key] !== null && item[key] !== undefined 
                  ? item[key].toString().substring(0, 30) 
                  : '---'}
              </Text>
            ))}
          </View>
        )}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Database Viewer</Text>
        <View style={styles.placeholder} />
      </View>

      {renderTableSelector()}
      
      <View style={styles.tableContainer}>
        {renderTableData()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  placeholder: {
    width: 60,
  },
  tableSelector: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tableButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f1f1',
    marginRight: 10,
  },
  selectedTableButton: {
    backgroundColor: '#007AFF',
  },
  tableButtonText: {
    fontSize: 14,
    color: '#555',
  },
  selectedTableButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  tableContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#ff3b30',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#f7f7f7',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerCell: {
    flex: 1,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#555',
    paddingHorizontal: 5,
    minWidth: 100,
  },
  dataRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dataCell: {
    flex: 1,
    fontSize: 12,
    color: '#333',
    paddingHorizontal: 5,
    minWidth: 100,
  },
});

export default DatabaseViewerScreen; 