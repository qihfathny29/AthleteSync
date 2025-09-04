import React, { useState, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  Button, 
  Text, 
  StyleSheet, 
  Animated, 
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  Alert
} from 'react-native';
import axios from 'axios';

const { height: screenHeight } = Dimensions.get('window');

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('athlete'); // Default athlete
  const [showPassword, setShowPassword] = useState(false);
  
  // Animation values - pindah ke useRef untuk mencegah re-render
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;
  const buttonScale = React.useRef(new Animated.Value(1)).current;

  const handleRegister = async () => {
    try {
      const response = await axios.post('http://192.168.1.10:3000/api/auth/register', { 
        name, 
        email, 
        password, 
        role 
      });
      
      // Jika athlete, tampilkan pairing code
      if (role === 'athlete' && response.data.pairingCode) {
        Alert.alert(
          'Registrasi Berhasil! 🎉',
          `Kode Pairing Anda: ${response.data.pairingCode}\n\nBerikan kode ini kepada partner Anda untuk terhubung!`,
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
      } else {
        Alert.alert(
          'Registrasi Berhasil! 🎉',
          'Akun partner berhasil dibuat. Silakan login dan masukkan kode pairing dari athlete.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Terjadi kesalahan saat registrasi');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#F0F8F0" barStyle="dark-content" />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        nestedScrollEnabled={true}
        bounces={false}
      >
        <View 
          style={styles.formContainer}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Daftar Akun</Text>
            <Text style={styles.subtitle}>Bergabung dengan Calorie Tracker</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Saya adalah</Text>
              <View style={styles.roleContainer}>
                <TouchableOpacity 
                  style={[styles.roleButton, role === 'athlete' && styles.roleButtonActive]}
                  onPress={() => setRole('athlete')}
                >
                  <Text style={styles.roleIcon}>🏀</Text>
                  <Text style={[styles.roleText, role === 'athlete' && styles.roleTextActive]}>
                    Atlet
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.roleButton, role === 'partner' && styles.roleButtonActive]}
                  onPress={() => setRole('partner')}
                >
                  <Text style={styles.roleIcon}>💕</Text>
                  <Text style={[styles.roleText, role === 'partner' && styles.roleTextActive]}>
                    Partner
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nama Lengkap</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>👤</Text>
                <TextInput 
                  style={styles.inputWithIcon}
                  placeholder="Masukkan nama" 
                  placeholderTextColor="#888"
                  value={name} 
                  onChangeText={setName} 
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>📧</Text>
                <TextInput 
                  style={styles.inputWithIcon}
                  placeholder="Masukkan email" 
                  placeholderTextColor="#888"
                  value={email} 
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput 
                  style={styles.inputWithIcon}
                  placeholder="Masukkan password" 
                  placeholderTextColor="#888"
                  value={password} 
                  onChangeText={setPassword} 
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity 
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={styles.eyeIconText}>
                    {showPassword ? '👁️' : '🙈'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Register Button */}
            <TouchableOpacity 
              style={styles.registerButton} 
              onPress={handleRegister}
              activeOpacity={0.8}
            >
              <Text style={styles.registerButtonText}>Daftar</Text>
            </TouchableOpacity>

            {/* Login Link */}
            <TouchableOpacity 
              style={styles.loginButton} 
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.7}
            >
              <Text style={styles.loginButtonText}>
                Sudah punya akun? <Text style={styles.loginLinkText}>Masuk di sini</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F8F0', // Light green background
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    minHeight: screenHeight,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#2E8B57',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E8B57', // Dark green
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E8B57',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#F9F9F9',
    paddingLeft: 15,
  },
  inputIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  inputWithIcon: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 15,
  },
  eyeIconText: {
    fontSize: 20,
  },
  input: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
    color: '#333',
    focusedBorderColor: '#2E8B57',
  },
  registerButton: {
    backgroundColor: '#2E8B57', // Dark green
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#2E8B57',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginButton: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 10,
  },
  loginButtonText: {
    fontSize: 16,
    color: '#666',
  },
  loginLinkText: {
    color: '#2E8B57',
    fontWeight: '600',
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  roleButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
  },
  roleButtonActive: {
    borderColor: '#2E8B57',
    backgroundColor: '#E8F5E8',
  },
  roleIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  roleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  roleTextActive: {
    color: '#2E8B57',
  },
});