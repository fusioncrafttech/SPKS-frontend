import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, FlatList, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { MenuRow } from '@/components/ui/menu-row';
import { useTheme } from '@/contexts/theme-context';
import { CatalogItem, itemSubtitle, itemTitle, openCatalogItem } from '@/lib/catalog';
import { promptPremium } from '@/lib/tests';

type Props = {
  visible: boolean;
  title: string;
  loading?: boolean;
  items: CatalogItem[];
  emptyMessage?: string;
  onClose: () => void;
};

export function ApiResultsModal({
  visible,
  title,
  loading,
  items,
  emptyMessage = 'No content has been published yet.',
  onClose,
}: Props) {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: colors.background }]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <ThemedText style={[styles.title, { color: colors.text }]}>{title}</ThemedText>
            <TouchableOpacity onPress={onClose} style={[styles.close, { backgroundColor: colors.card }]}>
              <Ionicons name="close" size={18} color={colors.text} />
            </TouchableOpacity>
          </View>
          {loading ? (
            <View style={styles.centered}>
              <ActivityIndicator color={colors.tint} />
              <ThemedText style={[styles.hint, { color: colors.textSecondary }]}>Loading...</ThemedText>
            </View>
          ) : (
            <FlatList
              data={items}
              keyExtractor={(item) => item.id}
              contentContainerStyle={items.length ? styles.list : styles.centered}
              ListEmptyComponent={
                <ThemedText style={[styles.hint, { color: colors.textSecondary }]}>{emptyMessage}</ThemedText>
              }
              renderItem={({ item, index }) => (
                <MenuRow
                  title={itemTitle(item)}
                  subtitle={item.isLocked ? 'Premium' : itemSubtitle(item) || (item.totalQuestions ? `${item.totalQuestions} questions` : undefined)}
                  icon={item.isLocked ? 'lock-closed-outline' : item.category === 'test' || item.totalQuestions ? 'create-outline' : 'document-text-outline'}
                  index={index}
                  locked={item.isLocked}
                  onPress={() => {
                    if (item.isLocked) {
                      onClose();
                      promptPremium('This file is locked. Buy a plan to view it.');
                      return;
                    }
                    onClose();
                    void openCatalogItem(item);
                  }}
                />
              )}
              ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '78%',
    minHeight: 240,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  handle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    flex: 1,
    marginRight: 12,
  },
  close: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centered: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
  },
  list: {
    paddingBottom: 24,
  },
});
