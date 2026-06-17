import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Colors } from '../../constants/Colors';
import { Styles, moderateScale } from '../../constants/Styles';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = () => {
    // In a real app we would validate and create user here.
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView 
      style={Styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={Styles.title}>Create Account</Text>
          <Text style={Styles.subtitle}>Start managing your properties today</Text>
        </View>

        <View style={styles.form}>
          <Input 
            label="Full Name" 
            placeholder="John Doe" 
            value={name}
            onChangeText={setName}
          />
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
            title="Sign Up" 
            onPress={handleRegister} 
            style={styles.registerBtn}
          />

          <View style={[Styles.rowCentered, styles.footer]}>
            <Text style={Styles.body}>Already have an account? </Text>
            <Link href={"/auth/login" as any} style={styles.link}>
              Sign in
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
  form: {
    width: '100%',
  },
  registerBtn: {
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
