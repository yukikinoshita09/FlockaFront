# Flocka API Utils

React Native/Expo専用のAPI通信ユーティリティライブラリです。役割ごとにファイルを分割し、認証、カード管理、交換記録管理など、Flockaアプリに必要な機能を提供します。

## 📁 ファイル構成

```
utils/
├── index.ts         # メインエクスポート
├── types.ts         # TypeScript型定義
├── config.ts        # API設定とエラークラス
├── storage.ts       # セキュアストレージ管理
├── httpClient.ts    # HTTP通信クライアント
├── authApi.ts       # 認証API
├── cardApi.ts       # カードAPI
├── exchangeApi.ts   # 交換記録API
├── helpers.ts       # ヘルパー関数
└── hooks.ts         # React hooks
```

## 🚀 基本的な使い方

### 1. 認証

```typescript
import { useAuth } from './utils';

function LoginScreen() {
  const { login, register, logout, user, isLoggedIn, isLoading } = useAuth();

  const handleLogin = async () => {
    const result = await login({
      email: 'user@example.com',
      password: 'password123'
    });
    
    if (result.success) {
      console.log('ログイン成功');
    } else {
      console.error('ログイン失敗:', result.error);
    }
  };

  const handleRegister = async () => {
    const result = await register({
      username: 'newuser',
      email: 'newuser@example.com',
      password: 'password123'
    });
    
    if (result.success) {
      console.log('登録成功');
    } else {
      console.error('登録失敗:', result.error);
    }
  };

  const handleLogout = async () => {
    await logout();
    console.log('ログアウト完了');
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <View>
      {isLoggedIn ? (
        <View>
          <Text>こんにちは、{user?.username}さん</Text>
          <Button title="ログアウト" onPress={handleLogout} />
        </View>
      ) : (
        <View>
          <Button title="ログイン" onPress={handleLogin} />
          <Button title="新規登録" onPress={handleRegister} />
        </View>
      )}
    </View>
  );
}
```

### 2. カード管理

```typescript
import { useCards } from './utils';
import * as ImagePicker from 'expo-image-picker';

function CardScreen() {
  const { 
    cards, 
    isLoading, 
    fetchCards, 
    createCard, 
    updateCard, 
    deleteCard, 
    uploadImage 
  } = useCards();

  useEffect(() => {
    fetchCards();
  }, []);

  const handleCreateCard = async () => {
    const result = await createCard({
      name: 'My New Card',
      description: 'Card description',
      category: 'sports',
      links: [
        { platform: 'twitter', url: 'https://twitter.com/user' },
        { platform: 'instagram', url: 'https://instagram.com/user' }
      ]
    });

    if (result.success) {
      console.log('カード作成成功:', result.card);
    } else {
      console.error('カード作成失敗:', result.error);
    }
  };

  const handleImageUpload = async () => {
    // 画像選択
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      
      // 画像アップロード
      const uploadResult = await uploadImage(imageUri);
      
      if (uploadResult.success) {
        console.log('画像アップロード成功:', uploadResult.data);
        // カード作成時にimage_keyを使用
        await createCard({
          name: 'Image Card',
          description: 'Card with image',
          image_key: uploadResult.data.key,
          category: 'hobby'
        });
      } else {
        console.error('画像アップロード失敗:', uploadResult.error);
      }
    }
  };

  const handleUpdateCard = async (cardId: string) => {
    const result = await updateCard(cardId, {
      name: 'Updated Card Name',
      description: 'Updated description'
    });

    if (result.success) {
      console.log('カード更新成功:', result.card);
    } else {
      console.error('カード更新失敗:', result.error);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    const result = await deleteCard(cardId);

    if (result.success) {
      console.log('カード削除成功');
    } else {
      console.error('カード削除失敗:', result.error);
    }
  };

  return (
    <View>
      <Button title="新しいカード作成" onPress={handleCreateCard} />
      <Button title="画像付きカード作成" onPress={handleImageUpload} />
      
      {isLoading ? (
        <Text>読み込み中...</Text>
      ) : (
        <FlatList
          data={cards}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View>
              <Text>{item.name}</Text>
              <Text>{item.description}</Text>
              {item.imageUrl && <Image source={{ uri: item.imageUrl }} />}
              <Button 
                title="更新" 
                onPress={() => handleUpdateCard(item.id)} 
              />
              <Button 
                title="削除" 
                onPress={() => handleDeleteCard(item.id)} 
              />
            </View>
          )}
        />
      )}
    </View>
  );
}
```

### 3. 交換記録管理

```typescript
import { useExchanges } from './utils';

function ExchangeScreen() {
  const { 
    exchanges, 
    isLoading, 
    fetchExchanges, 
    createExchange, 
    updateExchange, 
    deleteExchange 
  } = useExchanges();

  useEffect(() => {
    fetchExchanges();
  }, []);

  const handleCreateExchange = async () => {
    const result = await createExchange({
      my_card_id: 'my-card-id-123',
      partner_card_id: 'partner-card-id-456',
      exchange_type: 'trade',
      notes: '素晴らしい交換でした！'
    });

    if (result.success) {
      console.log('交換記録作成成功:', result.exchange);
    } else {
      console.error('交換記録作成失敗:', result.error);
    }
  };

  const handleUpdateExchange = async (exchangeId: string) => {
    const result = await updateExchange(exchangeId, {
      notes: '更新されたメモ',
      exchange_type: 'gift'
    });

    if (result.success) {
      console.log('交換記録更新成功:', result.exchange);
    } else {
      console.error('交換記録更新失敗:', result.error);
    }
  };

  return (
    <View>
      <Button title="新しい交換記録" onPress={handleCreateExchange} />
      
      {isLoading ? (
        <Text>読み込み中...</Text>
      ) : (
        <FlatList
          data={exchanges}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View>
              <Text>交換タイプ: {item.exchange_type}</Text>
              <Text>メモ: {item.notes}</Text>
              <Text>作成日: {new Date(item.created_at).toLocaleDateString()}</Text>
              <Button 
                title="更新" 
                onPress={() => handleUpdateExchange(item.id)} 
              />
              <Button 
                title="削除" 
                onPress={() => deleteExchange(item.id)} 
              />
            </View>
          )}
        />
      )}
    </View>
  );
}
```

## 🔧 個別API使用方法

### 認証API（authApi）

```typescript
import { authApi } from './utils';

// ユーザー登録
const registerResult = await authApi.register({
  username: 'newuser',
  email: 'user@example.com',
  password: 'password123'
});

// ログイン
const loginResult = await authApi.login({
  email: 'user@example.com',
  password: 'password123'
});

// 現在のユーザー情報取得
const userInfo = await authApi.getMe();

// メール認証
const verifyResult = await authApi.verifyEmail({
  email: 'user@example.com',
  code: '123456'
});

// アカウント削除
const deleteResult = await authApi.deleteAccount();

// ログアウト
await authApi.logout();
```

### カードAPI（cardApi）

```typescript
import { cardApi } from './utils';

// 画像アップロード
const uploadResult = await cardApi.uploadImage(
  'file:///path/to/image.jpg',
  'my-image.jpg',
  'image/jpeg'
);

// カード作成
const createResult = await cardApi.create({
  name: 'My Card',
  description: 'Description',
  category: 'sports',
  image_key: uploadResult.data?.key,
  links: [
    { platform: 'twitter', url: 'https://twitter.com/user' }
  ]
});

// 自分のカード一覧取得
const myCards = await cardApi.getMyCards();

// カード更新
const updateResult = await cardApi.update('card-id', {
  name: 'Updated Name'
});

// カード削除
const deleteResult = await cardApi.delete('card-id');

// 画像URL生成
const imageUrl = cardApi.getImageUrl('image-key');
```

### 交換API（exchangeApi）

```typescript
import { exchangeApi } from './utils';

// 交換記録作成
const createResult = await exchangeApi.create({
  my_card_id: 'my-card-id',
  partner_card_id: 'partner-card-id',
  exchange_type: 'trade',
  notes: 'Great exchange!'
});

// 自分の交換記録一覧
const myExchanges = await exchangeApi.getMyExchanges();

// 交換記録詳細取得
const exchange = await exchangeApi.getById('exchange-id');

// 交換記録更新
const updateResult = await exchangeApi.update('exchange-id', {
  notes: 'Updated notes'
});

// 交換記録削除
const deleteResult = await exchangeApi.delete('exchange-id');
```

## 🛠 ヘルパー関数

```typescript
import { helpers } from './utils';

// ログイン状態チェック
const isLoggedIn = await helpers.isLoggedIn();

// エラーメッセージ取得
try {
  // API call
} catch (error) {
  const message = helpers.getErrorMessage(error);
  console.error(message);
}

// カードリンクのパース
const links = helpers.parseCardLinks('{"platform":"twitter","url":"..."}');

// カードリンクの文字列化
const linksJson = helpers.stringifyCardLinks([
  { platform: 'twitter', url: 'https://twitter.com/user' }
]);

// 画像ファイルのバリデーション
const validation = helpers.validateImageFile(1024000, 'image/jpeg');
if (!validation.isValid) {
  console.error(validation.error);
}
```

## 🔒 セキュリティ

- **トークン管理**: `expo-secure-store`を使用した安全なトークン保存
- **自動認証**: APIリクエスト時に自動でJWTトークンを付与
- **エラーハンドリング**: 統一されたエラー処理とメッセージ

## ⚙️ 設定

環境変数（不要な場合は、`config.ts`で直接設定）:

```bash
EXPO_PUBLIC_API_BASE_URL=https://api.flocka.net
```

## 📝 型安全性

全てのAPI呼び出し、レスポンス、エラーに対してTypeScriptの型定義を提供しています。IDEの自動補完とコンパイル時の型チェックを活用できます。

## 🐛 エラーハンドリング

```typescript
try {
  const result = await authApi.login(credentials);
  if (result.success) {
    // 成功時の処理
  } else {
    // APIエラー
    console.error('API Error:', result.error);
  }
} catch (error) {
  // ネットワークエラーなど
  const message = helpers.getErrorMessage(error);
  console.error('Network Error:', message);
}
```

このライブラリを使用することで、Flockaアプリの全てのAPI通信を効率的に管理できます。
