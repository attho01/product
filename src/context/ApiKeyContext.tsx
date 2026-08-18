import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ApiKeyContextType {
  apiKey: string;
  isKeyVerified: boolean;
  isValidating: boolean;
  verificationError: string | null;
  verifiedModel: string | null;
  verifyAndSetApiKey: (key: string) => Promise<boolean>;
  clearApiKey: () => void;
  getAuthHeaders: () => Record<string, string>;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

export const ApiKeyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Purely in-memory React state (never persisted to localStorage or sessionStorage)
  const [apiKey, setApiKey] = useState<string>('');
  const [isKeyVerified, setIsKeyVerified] = useState<boolean>(false);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verifiedModel, setVerifiedModel] = useState<string | null>(null);

  const verifyAndSetApiKey = async (keyToVerify: string): Promise<boolean> => {
    const trimmedKey = keyToVerify.trim();
    if (!trimmedKey) {
      setVerificationError('API Key를 입력해 주세요.');
      return false;
    }

    setIsValidating(true);
    setVerificationError(null);

    try {
      const response = await fetch('/api/verify-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey: trimmedKey }),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        setApiKey(trimmedKey);
        setIsKeyVerified(true);
        setVerifiedModel(data.model || 'gemini-2.5-flash');
        setVerificationError(null);
        return true;
      } else {
        setIsKeyVerified(false);
        setVerificationError(data.error || 'API Key 승인에 실패하였습니다.');
        return false;
      }
    } catch (err: any) {
      setIsKeyVerified(false);
      setVerificationError(
        '백엔드 검증 서버와 통신하는 중 오류가 발생했습니다. 네트워크 연결 상태를 확인해 주세요.'
      );
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const clearApiKey = () => {
    setApiKey('');
    setIsKeyVerified(false);
    setVerificationError(null);
    setVerifiedModel(null);
  };

  const getAuthHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }
    return headers;
  };

  return (
    <ApiKeyContext.Provider
      value={{
        apiKey,
        isKeyVerified,
        isValidating,
        verificationError,
        verifiedModel,
        verifyAndSetApiKey,
        clearApiKey,
        getAuthHeaders,
      }}
    >
      {children}
    </ApiKeyContext.Provider>
  );
};

export const useApiKey = (): ApiKeyContextType => {
  const context = useContext(ApiKeyContext);
  if (!context) {
    throw new Error('useApiKey must be used within an ApiKeyProvider');
  }
  return context;
};
