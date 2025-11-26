// utils/tokenHelper.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export const checkTokenExpiration = async (): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    
    if (!token) {
      return false; 
    }

    // Dekodiraj JWT token da provjeriš expiration
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();

    console.log('🔐 Token check:', {
      issued: new Date(payload.iat * 1000).toLocaleString(),
      expires: new Date(expirationTime).toLocaleString(),
      now: new Date(currentTime).toLocaleString(),
      isValid: currentTime < expirationTime
    });

    // Ako je token istekao
    if (currentTime >= expirationTime) {
      console.log('❌ Token expired, logging out...');
      await logout();
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    await logout();
    return false;
  }
};

export const logout = async () => {
  try {
    await AsyncStorage.multiRemove([
      'userToken', 
      'userRole', 
      'userName', 
      'userEmail', 
      'userId'
    ]);
    console.log('✅ Logout completed - all data cleared');
  } catch (error) {
    console.error('Logout error:', error);
  }
};