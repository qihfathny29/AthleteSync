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
  Alert,
  Dimensions
} from 'react-native';
import axios from 'axios';
// Tambahin storage token, misal AsyncStorage dari @react-native-async-storage/async-storage

const { height: screenHeight } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Animation values - pindah ke useRef untuk mencegah re-render
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;
  const buttonScale = React.useRef(new Animated.Value(1)).current;

  const handleLogin = async () => {
    try {
      const res = await axios.post('http://192.168.1.10:3000/api/auth/login', { email, password });
      
      // Navigate ke dashboard dengan user data
      navigation.navigate('Dashboard', { user: res.data.user });
    } catch (err) {
      if (err.response) {
        console.log('Error:', err.response.data);
        Alert.alert('Login Gagal', err.response.data.msg || 'Terjadi kesalahan saat login');
      } else {
        console.error(err);
        Alert.alert('Error', 'Tidak dapat terhubung ke server');
      }
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
            <Text style={styles.title}>Selamat Datang</Text>
            <Text style={styles.subtitle}>Masuk ke akun Calorie Tracker Anda</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
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

            {/* Login Button */}
            <TouchableOpacity 
              style={styles.loginButton} 
              onPress={handleLogin}
              activeOpacity={0.8}
            >
              <Text style={styles.loginButtonText}>Masuk</Text>
            </TouchableOpacity>

            {/* Register Link */}
            <TouchableOpacity 
              style={styles.registerButton} 
              onPress={() => navigation.navigate('Register')}
              activeOpacity={0.7}
            >
              <Text style={styles.registerButtonText}>
                Belum punya akun? <Text style={styles.registerLinkText}>Daftar di sini</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default LoginScreen;

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
  loginButton: {
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
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerButton: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 10,
  },
  registerButtonText: {
    fontSize: 16,
    color: '#666',
  },
  registerLinkText: {
    color: '#2E8B57',
    fontWeight: '600',
  },
});