import { ActivityIndicator, FlatList, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/contexts/theme-context';
import { CatalogItem, itemSubtitle, itemTitle, openCatalogItem } from '@/lib/catalog';

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
        <View style={[styles.sheet, { backgroundColor: colors.card }]}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <ThemedText style={[styles.title, { color: colors.text }]}>{title}</ThemedText>
            <TouchableOpacity onPress={onClose}>
              <ThemedText style={[styles.close, { color: colors.textSecondary }]}>✕</ThemedText>
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
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.item, { borderBottomColor: colors.border }]}
                  onPress={() => openCatalogItem(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.itemText}>
                    <ThemedText style={[styles.itemTitle, { color: colors.text }]}>{itemTitle(item)}</ThemedText>
                    {!!itemSubtitle(item) && (
                      <ThemedText style={[styles.itemSubtitle, { color: colors.textSecondary }]} numberOfLines={2}>
                        {itemSubtitle(item)}
                      </ThemedText>
                    )}
                  </View>
                  <ThemedText style={[styles.arrow, { color: colors.textMuted }]}>›</ThemedText>
                </TouchableOpacity>
              )}
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '75%',
    minHeight: 220,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    marginRight: 12,
  },
  close: {
    fontSize: 20,
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
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  itemText: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 13,
  },
  arrow: {
    fontSize: 22,
    fontWeight: '300',
    marginLeft: 8,
  },
});

