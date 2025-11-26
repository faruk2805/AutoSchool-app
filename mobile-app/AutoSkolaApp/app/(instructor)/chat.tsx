import React, { useState, useEffect, useRef, useCallback } from "react";
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
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { io } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get("window");

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
  type: "text" | "image" | "file" | "system";
  status: "sent" | "delivered" | "read";
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
}

interface Candidate extends User {
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  hasUnread?: boolean;
  lastMessageType?: string;
}

export default function InstructorChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [socket, setSocket] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedImageForSend, setSelectedImageForSend] = useState<string>("");
  const [showCandidateList, setShowCandidateList] = useState(false);
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

  const fetchCandidates = async (token: string, userId: string) => {
    try {
      console.log('📞 Fetching candidates from:', `${API_BASE_URL}/api/chat/candidates`);
      
      const response = await fetch(`${API_BASE_URL}/api/chat/candidates`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const candidatesData = await response.json();
        console.log('✅ Candidates fetched:', candidatesData);
        
        if (candidatesData.length > 0) {
          setCandidates(candidatesData);
          setSelectedCandidate(candidatesData[0]);
          await loadMessages(candidatesData[0]._id, token, userId);
        } else {
          console.log('📝 No candidates found, using mock data');
          createMockCandidates(userId, token);
        }
      } else {
        console.log('❌ Failed to fetch candidates, status:', response.status);
        createMockCandidates(userId, token);
      }
    } catch (error) {
      console.error('❌ Error fetching candidates:', error);
      createMockCandidates(userId, token);
    }
  };

  const createMockCandidates = async (userId: string, token: string) => {
    const mockCandidates: Candidate[] = [
      {
        _id: '65a1b2c3d4e5f67890123457',
        name: 'Adnan',
        surname: 'Hodžić',
        email: 'adnan.hodzic@test.com',
        role: 'candidate',
        lastMessage: 'Hvala na instruktazi!',
        unreadCount: 0
      },
      {
        _id: '65a1b2c3d4e5f67890123458',
        name: 'Amir',
        surname: 'Hasić',
        email: 'amir.hasic@test.com',
        role: 'candidate',
        lastMessage: 'Kada je sljedeća vožnja?',
        unreadCount: 2
      }
    ];

    setCandidates(mockCandidates);
    setSelectedCandidate(mockCandidates[0]);
    await loadMessages(mockCandidates[0]._id, token, userId);
  };

  const loadMessages = async (candidateId: string, token: string, userId: string) => {
    try {
      setLoadingMessages(true);
      console.log('📥 Loading messages for candidate:', candidateId);

      const response = await fetch(
        `${API_BASE_URL}/api/chat/conversation/${candidateId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Messages loaded:', data.length);
        setMessages(data);
        
        setCandidates(prev => prev.map(candidate => 
          candidate._id === candidateId 
            ? { ...candidate, unreadCount: 0 }
            : candidate
        ));

        await markConversationAsRead(candidateId, token);
      } else {
        console.log('❌ Failed to load messages, using mock data');
        setMessages(getMockMessages(candidateId, userId));
      }
    } catch (error) {
      console.error('❌ Error loading messages:', error);
      setMessages(getMockMessages(candidateId, userId));
    } finally {
      setLoadingMessages(false);
      setLoading(false);
      setIsInitialized(true);
    }
  };

  const getMockMessages = (candidateId: string, userId: string): Message[] => {
    return [
      {
        _id: '1',
        sender: {
          _id: candidateId,
          name: 'Faruk',
          surname: 'Hasić',
          role: 'candidate'
        },
        receiver: {
          _id: userId,
          name: currentUser?.name || 'Instruktor',
          surname: currentUser?.surname || '',
          role: 'instructor'
        },
        content: 'Dobar dan instruktore! Kada možemo imati sljedeću vožnju?',
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
          name: currentUser?.name || 'Instruktor',
          surname: currentUser?.surname || '',
          role: 'instructor'
        },
        receiver: {
          _id: candidateId,
          name: 'Faruk',
          surname: 'Hasić',
          role: 'candidate'
        },
        content: 'Dobar dan! Sljedeći termin možemo imati sutra u 14:00.',
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
        
        if (selectedCandidate && 
            (message.sender._id === selectedCandidate._id || 
             message.receiver._id === selectedCandidate._id)) {
          setMessages(prev => [...prev, message]);
        }
        
        setCandidates(prev => prev.map(candidate => {
          if (candidate._id === message.sender._id) {
            return {
              ...candidate,
              lastMessage: message.content,
              lastMessageTime: message.createdAt,
              lastMessageType: message.type,
              unreadCount: (candidate.unreadCount || 0) + 1
            };
          }
          return candidate;
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

  const selectCandidate = async (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setShowCandidateList(false);

    const token = await AsyncStorage.getItem("userToken");
    const userData = await AsyncStorage.getItem("user");

    if (token && userData) {
      const user = JSON.parse(userData);
      await loadMessages(candidate._id, token, user._id);
    }
  };

  const sendMessage = async () => {
    if ((!newMessage.trim() && !selectedImageForSend) || !currentUser || !selectedCandidate || sending) return;

    try {
      setSending(true);

      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        Alert.alert('Greška', 'Niste prijavljeni');
        return;
      }

      const messageData = {
        receiver: selectedCandidate._id,
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

        // UPDATE CANDIDATES LIST
        setCandidates(prev => prev.map(candidate => {
          if (candidate._id === selectedCandidate._id) {
            return {
              ...candidate,
              lastMessage: newMessage.trim() || '📷 Slika',
              lastMessageTime: new Date().toISOString(),
              lastMessageType: selectedImageForSend ? 'image' : 'text'
            };
          }
          return candidate;
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
              <LinearGradient
                colors={['#4FC377', '#3BAF6D']}
                style={styles.avatarGradient}
              >
                <Text style={styles.otherUserAvatarText}>
                  {senderName.charAt(0)}{senderSurname.charAt(0)}
                </Text>
              </LinearGradient>
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
              <LinearGradient
                colors={['#2086F6', '#1A75E0']}
                style={styles.avatarGradient}
              >
                <Text style={styles.myUserAvatarText}>
                  {currentUserName.charAt(0)}{currentUserSurname.charAt(0)}
                </Text>
              </LinearGradient>
            </View>
          )}
        </View>
      </Animated.View>
    );
  };

  const renderCandidateItem = ({ item }: { item: Candidate }) => {
    const candidateName = item.name || 'Nepoznato';
    const candidateSurname = item.surname || '';

    return (
      <TouchableOpacity
        style={[
          styles.candidateItem,
          selectedCandidate?._id === item._id && styles.selectedCandidateItem,
        ]}
        onPress={() => selectCandidate(item)}
      >
        <View style={styles.candidateAvatar}>
          <LinearGradient
            colors={['#2086F6', '#1A75E0']}
            style={styles.candidateAvatarGradient}
          >
            <Text style={styles.candidateAvatarText}>
              {candidateName.charAt(0)}
              {candidateSurname.charAt(0)}
            </Text>
          </LinearGradient>
          <View style={[styles.statusIndicator, styles.statusOnline]} />
        </View>
        <View style={styles.candidateInfo}>
          <Text style={styles.candidateName}>
            {candidateName} {candidateSurname}
          </Text>
          <Text style={styles.candidateLastMessage} numberOfLines={1}>
            {item.lastMessage || "Počnite razgovor"}
          </Text>
        </View>
        <View style={styles.candidateMeta}>
          <Text style={styles.candidateTime}>
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
        <StatusBar barStyle="light-content" backgroundColor="#2086F6" />
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.loadingText}>Učitavanje chata...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2086F6" />
      
      {/* Header */}
      <LinearGradient
        colors={['#2086F6', '#1A75E0']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.candidateSelector}
            onPress={() => setShowCandidateList(true)}
          >
            <View style={styles.headerUserInfo}>
              <View style={styles.headerAvatar}>
                <LinearGradient
                  colors={['#FFFFFF', '#F8F9FA']}
                  style={styles.headerAvatarGradient}
                >
                  <Ionicons name="chatbubbles" size={24} color="#2086F6" />
                </LinearGradient>
              </View>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>Chat</Text>
                <Text style={styles.headerSubtitle}>
                  {selectedCandidate
                    ? `${selectedCandidate.name} ${selectedCandidate.surname}`
                    : "Odaberite kandidata"}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-down" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="search" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="ellipsis-vertical" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Loading Messages Indicator */}
      {loadingMessages && (
        <View style={styles.messagesLoadingContainer}>
          <ActivityIndicator size="small" color="#2086F6" />
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
                Započnite razgovor s {selectedCandidate?.name}
              </Text>
            </View>
          }
        />
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2086F6" />
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
              <LinearGradient
                colors={['#2086F6', '#1A75E0']}
                style={styles.mediaButtonGradient}
              >
                <Ionicons name="image" size={20} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.mediaButton} onPress={takePhoto}>
              <LinearGradient
                colors={['#4FC377', '#3BAF6D']}
                style={styles.mediaButtonGradient}
              >
                <Ionicons name="camera" size={20} color="#FFFFFF" />
              </LinearGradient>
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
              <LinearGradient
                colors={(!newMessage.trim() && !selectedImageForSend) || sending ? 
                  ['#C7C7CC', '#AEAEB2'] : ['#2086F6', '#1A75E0']}
                style={styles.sendButtonGradient}
              >
                {sending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="send" size={20} color="#FFFFFF" />
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Candidate List Modal */}
      <Modal
        visible={showCandidateList}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCandidateList(false)}
      >
        <View style={styles.candidateModalContainer}>
          <LinearGradient
            colors={['#2086F6', '#1A75E0']}
            style={styles.candidateModalHeader}
          >
            <Text style={styles.candidateModalTitle}>
              Kandidati
            </Text>
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setShowCandidateList(false)}
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </LinearGradient>
          <FlatList
            data={candidates}
            renderItem={renderCandidateItem}
            keyExtractor={(item) => item._id}
            style={styles.candidatesList}
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
    backgroundColor: "#F8F9FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2086F6",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#FFFFFF",
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
    color: "#2086F6",
    fontWeight: "500",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  candidateSelector: {
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
    marginRight: 12,
  },
  headerAvatarGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
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
    backgroundColor: "#F8F9FA",
  },
  messagesContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  messageWrapper: {
    marginBottom: 16,
  },
  dateSeparator: {
    alignItems: "center",
    marginVertical: 20,
  },
  dateSeparatorText: {
    backgroundColor: "#E5E5EA",
    paddingHorizontal: 16,
    paddingVertical: 8,
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
    padding: 16,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  myMessageBubble: {
    backgroundColor: "#2086F6",
    borderBottomRightRadius: 8,
  },
  otherMessageBubble: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 8,
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
    color: "#1F2937",
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
    marginRight: 8,
    marginBottom: 4,
  },
  myUserAvatar: {
    marginLeft: 8,
    marginBottom: 4,
  },
  avatarGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  otherUserAvatarText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  myUserAvatarText: {
    color: "#FFFFFF",
    fontSize: 14,
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
    padding: 20,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#F8F9FA",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  mediaButton: {
    marginRight: 8,
  },
  mediaButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxHeight: 100,
    color: "#1F2937",
  },
  sendButton: {
    borderRadius: 20,
    overflow: 'hidden',
    marginLeft: 8,
  },
  sendButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    opacity: 0.6,
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
    borderColor: "#2086F6",
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
  candidateModalContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  candidateModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
    paddingTop: 60,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  candidateModalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  candidatesList: {
    padding: 16,
  },
  candidateItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedCandidateItem: {
    backgroundColor: "#F0F9FF",
    borderColor: "#2086F6",
    borderWidth: 1,
  },
  candidateAvatar: {
    marginRight: 16,
    position: "relative",
  },
  candidateAvatarGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  candidateAvatarText: {
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
  candidateInfo: {
    flex: 1,
  },
  candidateName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  candidateLastMessage: {
    fontSize: 14,
    color: "#6B7280",
  },
  candidateMeta: {
    alignItems: "flex-end",
  },
  candidateTime: {
    fontSize: 12,
    color: "#9CA3AF",
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