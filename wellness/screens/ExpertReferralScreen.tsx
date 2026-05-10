import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from './navigation-types';
import { logAction } from '../modules/audit-logger';

type Props = NativeStackScreenProps<RootStackParamList, 'ExpertReferral'>;

/**
 * Kardiyovasküler eşik aşıldığında zorunlu olarak gösterilen ekran.
 * Kullanıcı "Anladım" demeden devam edemez.
 */
export default function ExpertReferralScreen({ navigation, route }: Props) {
  const { program, userId } = route.params;

  useEffect(() => {
    logAction(userId, 'UZMAN_YONLENDIRME', 'ExpertReferralScreen', 'SUCCESS');
  }, [userId]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.icon}>⚠️</Text>
        <Text style={styles.title}>Sağlık Uzmanına Başvurunuz</Text>
        <Text style={styles.body}>
          Değerlendirmenizde kardiyovasküler sistemle ilgili yüksek skor tespit
          edildi. Bu uygulama tıbbi teşhis koymaz; ancak sonuçlarınızı bir sağlık
          uzmanıyla paylaşmanızı önemle tavsiye ederiz.
        </Text>
        <Text style={styles.note}>
          Frekans programınız oluşturuldu ve görüntülenmeye hazır. Devam etmek
          kendi sorumluluğunuzdadır.
        </Text>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => navigation.replace('Result', { program, userId })}
        >
          <Text style={styles.btnText}>Anladım, Devam Et</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF7ED', justifyContent: 'center', padding: 24 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderTopWidth: 4,
    borderTopColor: '#F59E0B',
  },
  icon: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '800', color: '#92400E', textAlign: 'center', marginBottom: 16 },
  body: { fontSize: 14, color: '#78350F', lineHeight: 22, textAlign: 'center', marginBottom: 16 },
  note: { fontSize: 12, color: '#A16207', lineHeight: 18, textAlign: 'center', marginBottom: 28 },
  btn: {
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  btnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
});
