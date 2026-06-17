import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { Card } from '../../components/ui/Card';
import { Colors } from '../../constants/Colors';
import { Styles, moderateScale } from '../../constants/Styles';
import { useData } from '../../contexts/DataContext';
import { Building } from '../../types/models';

export default function BuildingsScreen() {
  const { buildings } = useData();
  const { width } = useWindowDimensions();
  
  const renderItem = ({ item }: { item: Building }) => (
    <TouchableOpacity activeOpacity={0.7} onPress={() => router.push(`/buildings/${item.id}` as any)}>
      <Card style={styles.cardContainer}>
        {item.photo ? (
          <Image source={{ uri: item.photo }} style={styles.cardImage} resizeMode="cover" />
        ) : (
          <View style={styles.placeholderImage}>
            <MaterialIcons name="domain" size={moderateScale(48)} color={Colors.border} />
          </View>
        )}
        <View style={styles.cardInfo}>
          <View style={Styles.rowBetween}>
            <View style={{ flex: 1, marginRight: moderateScale(12) }}>
              <Text style={Styles.label}>{item.name ?? item.address}</Text>
              {item.name && <Text style={Styles.body}>{item.address}</Text>}
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.roomCount} Chambres</Text>
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={Styles.container}>
      <FlatList
        data={buildings}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={Styles.contentPadding}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="domain-disabled" size={64} color={Colors.border} />
            <Text style={[Styles.subtitle, { marginTop: 16 }]}>Aucun bâtiment trouvé</Text>
          </View>
        }
      />
      
      <TouchableOpacity 
        style={[styles.fab, Styles.shadow]} 
        onPress={() => router.push('/buildings/add' as any)}
      >
        <MaterialIcons name="add" size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: moderateScale(12),
  },
  cardImage: {
    width: '100%',
    height: moderateScale(150),
  },
  placeholderImage: {
    width: '100%',
    height: moderateScale(150),
    backgroundColor: Colors.secondaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    padding: moderateScale(16),
  },
  badge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(6),
    borderRadius: moderateScale(16),
  },
  badgeText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: moderateScale(12),
  },
  emptyState: {
    padding: moderateScale(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: moderateScale(24),
    right: moderateScale(24),
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: moderateScale(28),
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
