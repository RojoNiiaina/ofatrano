import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Colors } from '../../constants/Colors';
import { Styles, moderateScale } from '../../constants/Styles';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // In a real app we would validate and auth here.
    // For now, redirect to the dashboard.
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView 
      style={Styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>PR</Text>
          </View>
          <Text style={Styles.title}>Welcome Back</Text>
          <Text style={Styles.subtitle}>Sign in to manage your properties</Text>
        </View>

        <View style={styles.form}>
          <Input 
            label="Email" 
            placeholder="admin@example.com" 
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input 
            label="Password" 
            placeholder="********" 
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <Button 
            title="Sign In" 
            onPress={handleLogin} 
            style={styles.loginBtn}
          />

          <View style={[Styles.rowCentered, styles.footer]}>
            <Text style={Styles.body}>Don't have an account? </Text>
            <Link href="/auth/register" style={styles.link}>
              Sign up
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    padding: moderateScale(24),
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: moderateScale(40),
  },
  logoPlaceholder: {
    width: moderateScale(64),
    height: moderateScale(64),
    backgroundColor: Colors.primaryLight,
    borderRadius: moderateScale(16),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: moderateScale(24),
  },
  logoText: {
    color: Colors.primary,
    fontSize: moderateScale(24),
    fontWeight: 'bold',
  },
  form: {
    width: '100%',
  },
  loginBtn: {
    marginTop: moderateScale(16),
  },
  footer: {
    justifyContent: 'center',
    marginTop: moderateScale(24),
  },
  link: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: moderateScale(14),
  }
});
