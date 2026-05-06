import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

interface Props {
  /** Array of local image URIs */
  images: string[];
}

const GAP = 2;

/**
 * ImageGrid — a 9-grid image layout inspired by WeChat Moments.
 *
 * Layout rules:
 *  - 1 image  => single column, 4:3 aspect ratio
 *  - 2-4 images => 2 columns, square thumbnails
 *  - 5-9 images => 3 columns, square thumbnails
 *
 * Each thumbnail has a 2 px gap between siblings.
 */
export default function ImageGrid({ images }: Props) {
  if (images.length === 0) {
    return null;
  }

  const count = images.length;
  const columns = count === 1 ? 1 : count <= 4 ? 2 : 3;
  const isSingle = count === 1;

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {images.map((uri, index) => (
          <View
            key={index}
            style={[
              styles.imageWrapper,
              {
                width: isSingle ? '100%' : `${100 / columns}%`,
                aspectRatio: isSingle ? 4 / 3 : 1,
                padding: GAP / 2,
              },
            ]}
          >
            <Image
              source={{ uri }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: -(GAP / 2),
  },
  imageWrapper: {
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
});
