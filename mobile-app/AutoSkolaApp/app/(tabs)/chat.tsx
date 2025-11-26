import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
  Dimensions,
  StatusBar,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const { width, height } = Dimensions.get('window');

interface Message {
  _id: string;
  sender: {
    _id: string;
    name: string;
    surname: string;
    role: string;
    email?: string;
    profileImage?: string;
  };
  receiver: {
    _id: string;
    name: string;
    surname: string;
    role: string;
    email?: string;
    profileImage?: string;
  };
  content: string;
  image?: {
    url: string;
    filename: string;
    size: number;
  };
  file?: {
    url: string;
    filename: string;
    size: number;
    originalName: string;
  };
  isGroup: boolean;
  type: 'text' | 'image' | 'file' | 'system';
  status: 'sent' | 'delivered' | 'read';
  createdAt: string;
  updatedAt: string;
}

interface User {
  _id: string;
  name: string;
  surname: string;
  role: string;
  email: string;
  profileImage?: string;
  instruktor?: {
    _id: string;
    name: string;
    surname: string;
    email: string;
  };
}

interface Instructor extends User {
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  hasUnread?: boolean;
  lastMessageType?: string;
}

export default function CandidateChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [socket, setSocket] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedImageForSend, setSelectedImageForSend] = useState<string>('');
  const [showInstructorList, setShowInstructorList] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const initializationRef = useRef(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || "http://192.168.1.9:5000";
  const SOCKET_URL = Constants.expoConfig?.extra?.socketUrl || "http://192.168.1.9:6000";

  useEffect(() => {
    if (isInitialized) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isInitialized]);

  const initializeChat = useCallback(async () => {
    if (initializationRef.current) return;
    
    initializationRef.current = true;
    
    try {
      setLoading(true);
      
      const userData = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('userToken');
      
      if (userData && token) {
        const user = JSON.parse(userData);
        
        const normalizedUser = {
          ...user,
          _id: user.id || user._id,
          id: user.id || user._id
        };
        
        if (!normalizedUser._id) {
          Alert.alert('Greška', 'Korisnički podaci nisu ispravni');
          setLoading(false);
          initializationRef.current = false;
          return;
        }
        
        setCurrentUser(normalizedUser);
        await fetchCandidates(token, normalizedUser._id);
        initializeSocket(normalizedUser, token);
      } else {
        Alert.alert('Greška', 'Niste prijavljeni');
        setLoading(false);
        initializationRef.current = false;
      }
    } catch (error) {
      console.error('❌ Error initializing chat:', error);
      Alert.alert('Greška', 'Došlo je do greške pri učitavanju chata');
      setLoading(false);
      initializationRef.current = false;
    }
  }, []);

  useEffect(() => {
    initializeChat();
    
    return () => {
      if (socket) {
        socket.disconnect();
      }
      initializationRef.current = false;
    };
  }, [initializeChat]);

  useEffect(() => {
    if (messages.length > 0 && scrollViewRef.current && isInitialized) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isInitialized]);

  // PROMJENA: fetchCandidates umjesto fetchInstructors
  const fetchCandidates = async (token: string, userId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/candidates`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const candidatesData = await response.json();
        
        if (candidatesData.length > 0) {
          setInstructors(candidatesData);
          setSelectedInstructor(candidatesData[0]);
          await loadMessages(candidatesData[0]._id, token, userId);
        } else {
          createMockInstructors(userId, token);
        }
      } else {
        console.log('❌ Failed to fetch candidates, status:', response.status);
        createMockInstructors(userId, token);
      }
    } catch (error) {
      console.error('❌ Error fetching candidates:', error);
      createMockInstructors(userId, token);
    }
  };

  const createMockInstructors = async (userId: string, token: string) => {
    const mockInstructors: Instructor[] = [
      {
        _id: '65a1b2c3d4e5f67890123456',
        name: 'Amir',
        surname: 'Hodžić',
        email: 'amir.hodzic@test.com',
        role: 'instructor',
        lastMessage: 'Sutra u 14:00 imamo vožnju!',
        unreadCount: 0
      }
    ];

    setInstructors(mockInstructors);
    setSelectedInstructor(mockInstructors[0]);
    await loadMessages(mockInstructors[0]._id, token, userId);
  };

  const loadMessages = async (instructorId: string, token: string, userId: string) => {
    try {
      setLoadingMessages(true);

      const response = await fetch(
        `${API_BASE_URL}/api/chat/conversation/${instructorId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(data);
        
        setInstructors(prev => prev.map(instructor => 
          instructor._id === instructorId 
            ? { ...instructor, unreadCount: 0 }
            : instructor
        ));

        await markConversationAsRead(instructorId, token);
      } else {
        console.log('❌ Failed to load messages, status:', response.status);
        setMessages(getMockMessages(instructorId, userId));
      }
    } catch (error) {
      console.error('❌ Error loading messages:', error);
      setMessages(getMockMessages(instructorId, userId));
    } finally {
      setLoadingMessages(false);
      setLoading(false);
      setIsInitialized(true);
    }
  };

  const getMockMessages = (instructorId: string, userId: string): Message[] => {
    return [
      {
        _id: '1',
        sender: {
          _id: instructorId,
          name: 'Amir',
          surname: 'Hodžić',
          role: 'instructor'
        },
        receiver: {
          _id: userId,
          name: currentUser?.name || 'Kandidat',
          surname: currentUser?.surname || '',
          role: 'candidate'
        },
        content: 'Dobar dan! Kako napredujete s vožnjom?',
        isGroup: false,
        type: 'text',
        status: 'read',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        _id: '2',
        sender: {
          _id: userId,
          name: currentUser?.name || 'Kandidat',
          surname: currentUser?.surname || '',
          role: 'candidate'
        },
        receiver: {
          _id: instructorId,
          name: 'Amir',
          surname: 'Hodžić',
          role: 'instructor'
        },
        content: 'Dobar dan! Sve je super, hvala na pitanju.',
        isGroup: false,
        type: 'text',
        status: 'read',
        createdAt: new Date(Date.now() - 3000000).toISOString(),
        updatedAt: new Date(Date.now() - 3000000).toISOString()
      }
    ];
  };

  const initializeSocket = (user: User, token: string) => {
    try {
      const normalizedUser = {
        _id: user.id || user._id,
        id: user.id || user._id,
        name: user.name,
        surname: user.surname || "",
        role: user.role,
        email: user.email,
      };

      console.log('🔌 Connecting to Socket.IO...', SOCKET_URL);

      const socketInstance = io(SOCKET_URL, {
        auth: {
          token: token,
          userId: normalizedUser._id,
          user: normalizedUser,
        },
        transports: ["websocket", "polling"],
        timeout: 10000,
      });

      socketInstance.on("connect", () => {
        console.log('✅ Socket.IO connected successfully');
        if (normalizedUser._id && normalizedUser._id !== "undefined") {
          socketInstance.emit("joinRoom", normalizedUser._id);
          console.log('📍 Joined room:', normalizedUser._id);
        }
      });

      socketInstance.on("receiveMessage", (message: Message) => {
        console.log('📨 Received message via Socket.IO:', message);
        
        if (selectedInstructor && 
            (message.sender._id === selectedInstructor._id || 
             message.receiver._id === selectedInstructor._id)) {
          setMessages(prev => [...prev, message]);
        }
        
        setInstructors(prev => prev.map(instructor => {
          if (instructor._id === message.sender._id) {
            return {
              ...instructor,
              lastMessage: message.content,
              lastMessageTime: message.createdAt,
              lastMessageType: message.type,
              unreadCount: (instructor.unreadCount || 0) + 1
            };
          }
          return instructor;
        }));
      });

      socketInstance.on("messagesRead", (data) => {
        console.log("✅ Messages marked as read:", data);
      });

      socketInstance.on("disconnect", () => {
        console.log("🔌 Socket disconnected");
      });

      socketInstance.on("connect_error", (error) => {
        console.error("❌ Socket connection error:", error);
      });

      socketInstance.on("error", (error) => {
        console.error("❌ Socket error:", error);
      });

      setSocket(socketInstance);
    } catch (error) {
      console.error("❌ Error initializing socket:", error);
    }
  };

  const markConversationAsRead = async (otherUserId: string, token: string) => {
    try {
      // Ovo ćeš implementirati kasnije kada dodaš rutu u backend
      console.log('📖 Marking conversation as read for:', otherUserId);
      
      if (socket && currentUser) {
        socket.emit('markAsRead', {
          userId: currentUser._id,
          otherUserId: otherUserId
        });
      }
    } catch (error) {
      console.error('Error marking conversation as read:', error);
    }
  };

  const selectInstructor = async (instructor: Instructor) => {
    setSelectedInstructor(instructor);
    setShowInstructorList(false);

    const token = await AsyncStorage.getItem("userToken");
    const userData = await AsyncStorage.getItem("user");

    if (token && userData) {
      const user = JSON.parse(userData);
      await loadMessages(instructor._id, token, user._id);
    }
  };

  const sendMessage = async () => {
    if ((!newMessage.trim() && !selectedImageForSend) || !currentUser || !selectedInstructor || sending) return;

    try {
      setSending(true);

      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        Alert.alert('Greška', 'Niste prijavljeni');
        return;
      }

      const messageData = {
        receiver: selectedInstructor._id,
        content: newMessage.trim() || (selectedImageForSend ? '📷 Slika' : ''),
        isGroup: false,
        type: selectedImageForSend ? 'image' : 'text',
        image: selectedImageForSend ? {
          url: selectedImageForSend,
          filename: `image_${Date.now()}.jpg`,
          size: 0
        } : undefined
      };

      console.log('📤 Sending message:', messageData);

      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(messageData),
      });

      if (response.ok) {
        const sentMessage = await response.json();
        console.log('✅ Message sent successfully:', sentMessage);
        
        // EMIT PORUKE PREKO SOCKETA
        if (socket) {
          socket.emit('sendMessage', {
            ...messageData,
            sender: currentUser._id.toString(),
            _id: sentMessage._id,
            createdAt: sentMessage.createdAt
          });
        }

        // DODAJ PORUKU U STATE
        setMessages(prev => [...prev, sentMessage]);

        // UPDATE INSTRUCTORS LIST
        setInstructors(prev => prev.map(instructor => {
          if (instructor._id === selectedInstructor._id) {
            return {
              ...instructor,
              lastMessage: newMessage.trim() || '📷 Slika',
              lastMessageTime: new Date().toISOString(),
              lastMessageType: selectedImageForSend ? 'image' : 'text'
            };
          }
          return instructor;
        }));

        // RESET INPUT
        setNewMessage('');
        setSelectedImageForSend('');
        
      } else {
        const errorText = await response.text();
        console.error('❌ Error response:', response.status, errorText);
        Alert.alert('Greška', 'Došlo je do greške pri slanju poruke');
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
      Alert.alert('Greška', 'Došlo je do greške pri slanju poruke');
    } finally {
      setSending(false);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Dozvola potrebna", "Potrebna je dozvola za pristup galeriji");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImageForSend(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Greška", "Došlo je do greške pri odabiru slike");
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Dozvola potrebna", "Potrebna je dozvola za korištenje kamere");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImageForSend(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Greška", "Došlo je do greške pri snimanju fotografije");
    }
  };

  const openImage = (imageUri: string) => {
    setSelectedImage(imageUri);
    setImageModalVisible(true);
  };

  const removeSelectedImage = () => {
    setSelectedImageForSend("");
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("bs-BA", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Danas";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Jučer";
    } else {
      return date.toLocaleDateString("bs-BA");
    }
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    if (!currentUser) {
      return (
        <View style={styles.messageWrapper}>
          <Text>Učitavanje...</Text>
        </View>
      );
    }

    const senderName = item.sender?.name || 'Nepoznato';
    const senderSurname = item.sender?.surname || '';
    const currentUserName = currentUser?.name || 'Korisnik';
    const currentUserSurname = currentUser?.surname || '';

    const isMyMessage = item.sender._id === currentUser._id;
    const showDate = index === 0 || formatDate(item.createdAt) !== formatDate(messages[index - 1]?.createdAt);

    return (
      <Animated.View 
        style={[
          styles.messageWrapper,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        {showDate && (
          <View style={styles.dateSeparator}>
            <Text style={styles.dateSeparatorText}>
              {formatDate(item.createdAt)}
            </Text>
          </View>
        )}

        <View
          style={[
            styles.messageContainer,
            isMyMessage
              ? styles.myMessageContainer
              : styles.otherMessageContainer,
          ]}
        >
          {!isMyMessage && (
            <View style={styles.otherUserAvatar}>
              <Text style={styles.otherUserAvatarText}>
                {senderName.charAt(0)}{senderSurname.charAt(0)}
              </Text>
            </View>
          )}
          
          <View
            style={[
              styles.messageBubble,
              isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble,
            ]}
          >
            {item.type === "image" && item.image && (
              <TouchableOpacity onPress={() => openImage(item.image.url)}>
                <Image
                  source={{ uri: item.image.url }}
                  style={styles.messageImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            )}
            {item.content ? (
              <Text
                style={[
                  styles.messageText,
                  isMyMessage ? styles.myMessageText : styles.otherMessageText,
                ]}
              >
                {item.content}
              </Text>
            ) : null}
            <Text
              style={[
                styles.messageTime,
                isMyMessage ? styles.myMessageTime : styles.otherMessageTime,
              ]}
            >
              {formatTime(item.createdAt)}
            </Text>
          </View>

          {isMyMessage && (
            <View style={styles.myUserAvatar}>
              <Text style={styles.myUserAvatarText}>
                {currentUserName.charAt(0)}{currentUserSurname.charAt(0)}
              </Text>
            </View>
          )}
        </View>
      </Animated.View>
    );
  };

  const renderInstructorItem = ({ item }: { item: Instructor }) => {
    const instructorName = item.name || 'Nepoznato';
    const instructorSurname = item.surname || '';

    return (
      <TouchableOpacity
        style={[
          styles.instructorItem,
          selectedInstructor?._id === item._id && styles.selectedInstructorItem,
        ]}
        onPress={() => selectInstructor(item)}
      >
        <View style={styles.instructorAvatar}>
          <Text style={styles.instructorAvatarText}>
            {instructorName.charAt(0)}
            {instructorSurname.charAt(0)}
          </Text>
          <View style={[styles.statusIndicator, styles.statusOnline]} />
        </View>
        <View style={styles.instructorInfo}>
          <Text style={styles.instructorName}>
            {instructorName} {instructorSurname}
          </Text>
          <Text style={styles.instructorLastMessage} numberOfLines={1}>
            {item.lastMessage || "Počnite razgovor"}
          </Text>
        </View>
        <View style={styles.instructorMeta}>
          <Text style={styles.instructorTime}>
            {item.lastMessageTime ? formatTime(item.lastMessageTime) : ''}
          </Text>
          {item.unreadCount && item.unreadCount > 0 ? (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{item.unreadCount}</Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Učitavanje chata...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.instructorSelector}
            onPress={() => setShowInstructorList(true)}
          >
            <View style={styles.headerUserInfo}>
              <View style={styles.headerAvatar}>
                <Text style={styles.headerAvatarText}>
                  {selectedInstructor ? 
                    `${(selectedInstructor.name || '').charAt(0)}${(selectedInstructor.surname || '').charAt(0)}` 
                    : '?'}
                </Text>
              </View>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>Chat</Text>
                <Text style={styles.headerSubtitle}>
                  {selectedInstructor
                    ? `${selectedInstructor.name || ''} ${selectedInstructor.surname || ''}`
                    : "Odaberite instruktora"}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
          
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="search" size={22} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="ellipsis-vertical" size={22} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Loading Messages Indicator */}
      {loadingMessages && (
        <View style={styles.messagesLoadingContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.messagesLoadingText}>Učitavanje poruka...</Text>
        </View>
      )}

      {/* Messages List */}
      {isInitialized && currentUser ? (
        <FlatList
          ref={scrollViewRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item._id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            setTimeout(() => {
              scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubble-ellipses-outline" size={80} color="#E5E5EA" />
              <Text style={styles.emptyText}>Pošaljite prvu poruku</Text>
              <Text style={styles.emptySubtext}>
                Započnite razgovor s {selectedInstructor?.name}
              </Text>
            </View>
          }
        />
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Priprema chata...</Text>
        </View>
      )}

      {/* Selected Image Preview */}
      {selectedImageForSend ? (
        <View style={styles.selectedImageContainer}>
          <Image
            source={{ uri: selectedImageForSend }}
            style={styles.selectedImage}
          />
          <TouchableOpacity
            style={styles.removeImageButton}
            onPress={removeSelectedImage}
          >
            <Ionicons name="close-circle" size={28} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Input Area */}
      {isInitialized && currentUser && (
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TouchableOpacity style={styles.mediaButton} onPress={pickImage}>
              <Ionicons name="image" size={24} color="#007AFF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.mediaButton} onPress={takePhoto}>
              <Ionicons name="camera" size={24} color="#007AFF" />
            </TouchableOpacity>

            <TextInput
              style={styles.textInput}
              placeholder="Poruka..."
              placeholderTextColor="#8E8E93"
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
              maxLength={1000}
            />

            <TouchableOpacity
              style={[
                styles.sendButton,
                ((!newMessage.trim() && !selectedImageForSend) || sending) &&
                  styles.sendButtonDisabled,
              ]}
              onPress={sendMessage}
              disabled={(!newMessage.trim() && !selectedImageForSend) || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="send" size={20} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Instructor List Modal */}
      <Modal
        visible={showInstructorList}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowInstructorList(false)}
      >
        <View style={styles.instructorModalContainer}>
          <View style={styles.instructorModalHeader}>
            <Text style={styles.instructorModalTitle}>
              Instruktori
            </Text>
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setShowInstructorList(false)}
            >
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={instructors}
            renderItem={renderInstructorItem}
            keyExtractor={(item) => item._id}
            style={styles.instructorsList}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Modal>

      {/* Image Preview Modal */}
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View style={styles.imageModalContainer}>
          <TouchableOpacity
            style={styles.imageModalBackground}
            onPress={() => setImageModalVisible(false)}
            activeOpacity={1}
          >
            <Image
              source={{ uri: selectedImage }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.closeImageModalButton}
            onPress={() => setImageModalVisible(false)}
          >
            <Ionicons name="close" size={30} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#8E8E93",
    fontWeight: "500",
  },
  messagesLoadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#F2F2F7",
  },
  messagesLoadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "500",
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingTop: 60,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  instructorSelector: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerUserInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  headerAvatarText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#8E8E93",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  messagesList: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  messagesContent: {
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  messageWrapper: {
    marginBottom: 12,
  },
  dateSeparator: {
    alignItems: "center",
    marginVertical: 20,
  },
  dateSeparatorText: {
    backgroundColor: "#E5E5EA",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    fontSize: 13,
    color: "#8E8E93",
    fontWeight: "500",
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 4,
  },
  myMessageContainer: {
    justifyContent: "flex-end",
  },
  otherMessageContainer: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    maxWidth: "75%",
    padding: 12,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  myMessageBubble: {
    backgroundColor: "#007AFF",
    borderBottomRightRadius: 6,
  },
  otherMessageBubble: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 6,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: -0.3,
  },
  myMessageText: {
    color: "#FFFFFF",
  },
  otherMessageText: {
    color: "#000000",
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginBottom: 8,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    opacity: 0.7,
  },
  myMessageTime: {
    color: "#E1F5FE",
    textAlign: "right",
  },
  otherMessageTime: {
    color: "#8E8E93",
    textAlign: "left",
  },
  otherUserAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#34C759",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    marginBottom: 4,
  },
  otherUserAvatarText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  myUserAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    marginBottom: 4,
  },
  myUserAvatarText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    color: "#8E8E93",
    fontWeight: "600",
    textAlign: "center",
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: "#C7C7CC",
    textAlign: "center",
  },
  inputContainer: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#F2F2F7",
    borderRadius: 22,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  mediaButton: {
    padding: 8,
    marginRight: 4,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxHeight: 100,
    color: "#000000",
  },
  sendButton: {
    backgroundColor: "#007AFF",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonDisabled: {
    backgroundColor: "#C7C7CC",
    shadowOpacity: 0,
    elevation: 0,
  },
  selectedImageContainer: {
    position: "relative",
    marginHorizontal: 16,
    marginBottom: 12,
    alignSelf: "flex-start",
  },
  selectedImage: {
    width: 120,
    height: 90,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  instructorModalContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: 60,
  },
  instructorModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  instructorModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000000",
  },
  instructorsList: {
    padding: 8,
  },
  instructorItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "#FFFFFF",
  },
  selectedInstructorItem: {
    backgroundColor: "#F2F8FF",
    borderColor: "#007AFF",
    borderWidth: 1,
  },
  instructorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    position: "relative",
  },
  instructorAvatarText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  statusIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  statusOnline: {
    backgroundColor: "#34C759",
  },
  statusOffline: {
    backgroundColor: "#C7C7CC",
  },
  instructorInfo: {
    flex: 1,
  },
  instructorName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 4,
  },
  instructorLastMessage: {
    fontSize: 14,
    color: "#8E8E93",
  },
  instructorMeta: {
    alignItems: "flex-end",
  },
  instructorTime: {
    fontSize: 12,
    color: "#8E8E93",
    marginBottom: 4,
  },
  unreadBadge: {
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  unreadCount: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  closeModalButton: {
    padding: 8,
  },
  imageModalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageModalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  fullScreenImage: {
    width: width * 0.95,
    height: width * 0.95,
  },
  closeImageModalButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
});