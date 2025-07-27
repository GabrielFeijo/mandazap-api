/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { PrismaClient } from '@prisma/client';
import {
  AuthenticationCreds,
  AuthenticationState,
  SignalDataTypeMap,
  BufferJSON,
  initAuthCreds,
} from 'baileys';

const prisma = new PrismaClient();

interface AuthStateOptions {
  instanceId: string;
}

export const useMongoAuthState = async (
  options: AuthStateOptions,
): Promise<{ state: AuthenticationState; saveCreds: () => Promise<void> }> => {
  const { instanceId } = options;

  const serialize = (data: any): string => {
    return JSON.stringify(data, BufferJSON.replacer);
  };

  const deserialize = (data: string): any => {
    return JSON.parse(data, BufferJSON.reviver);
  };

  const loadData = async (): Promise<{
    creds: AuthenticationCreds;
    keys: any;
  }> => {
    try {
      const sessions = await prisma.authSession.findMany({
        where: { instanceId },
      });

      let creds: AuthenticationCreds;
      const keys: any = {};

      const credsSession = sessions.find((s) => s.keyId === 'creds');
      if (credsSession) {
        creds = deserialize(credsSession.keyData);
      } else {
        creds = initAuthCreds();
      }

      for (const session of sessions) {
        if (session.keyId !== 'creds') {
          keys[session.keyId] = deserialize(session.keyData);
        }
      }

      return { creds, keys };
    } catch (error) {
      console.error('Erro ao carregar dados de autenticação:', error);

      return {
        creds: initAuthCreds(),
        keys: {},
      };
    }
  };

  const saveData = async (keyId: string, data: any): Promise<void> => {
    try {
      const serializedData = serialize(data);

      await prisma.authSession.upsert({
        where: {
          instanceId_keyId: {
            instanceId,
            keyId,
          },
        },
        update: {
          keyData: serializedData,
          updatedAt: new Date(),
        },
        create: {
          instanceId,
          keyId,
          keyData: serializedData,
        },
      });
    } catch (error) {
      console.error(`Erro ao salvar dados para keyId ${keyId}:`, error);
    }
  };

  const removeData = async (keyId: string): Promise<void> => {
    try {
      await prisma.authSession.delete({
        where: {
          instanceId_keyId: {
            instanceId,
            keyId,
          },
        },
      });
    } catch (error) {
      if (!error.code || error.code !== 'P2025') {
        console.error(`Erro ao remover dados para keyId ${keyId}:`, error);
      }
    }
  };

  const { creds, keys } = await loadData();

  const state: AuthenticationState = {
    creds,
    keys: {
      get: (
        type: keyof SignalDataTypeMap,
        ids: string[],
      ): { [id: string]: any } => {
        const result: { [id: string]: any } = {};
        for (const id of ids) {
          const key = `${type}-${id}`;
          if (keys[key]) {
            result[id] = keys[key];
          }
        }
        return result;
      },
      set: (data: any): void => {
        for (const type in data) {
          for (const id in data[type]) {
            const key = `${type}-${id}`;
            const value = data[type][id];

            if (value === null || value === undefined) {
              delete keys[key];

              removeData(key).catch(console.error);
            } else {
              keys[key] = value;

              saveData(key, value).catch(console.error);
            }
          }
        }
      },
    },
  };

  const saveCreds = async (): Promise<void> => {
    try {
      await saveData('creds', state.creds);
    } catch (error) {
      console.error('Erro ao salvar credenciais:', error);
    }
  };

  return { state, saveCreds };
};

export const clearAuthState = async (instanceId: string): Promise<void> => {
  try {
    const result = await prisma.authSession.deleteMany({
      where: { instanceId },
    });
    console.log(
      `${result.count} registros de autenticação removidos para instanceId: ${instanceId}`,
    );
  } catch (error) {
    console.error('Erro ao limpar dados de autenticação:', error);
    throw error;
  }
};

export const hasAuthState = async (instanceId: string): Promise<boolean> => {
  try {
    const credsExists = await prisma.authSession.findUnique({
      where: {
        instanceId_keyId: {
          instanceId,
          keyId: 'creds',
        },
      },
    });
    return !!credsExists;
  } catch (error) {
    console.error('Erro ao verificar estado de autenticação:', error);
    return false;
  }
};

export const getAuthStats = async (
  instanceId: string,
): Promise<{
  totalKeys: number;
  hasCredentials: boolean;
  lastUpdated: Date | null;
}> => {
  try {
    const sessions = await prisma.authSession.findMany({
      where: { instanceId },
      select: {
        keyId: true,
        updatedAt: true,
      },
    });

    const hasCredentials = sessions.some((s) => s.keyId === 'creds');
    const lastUpdated =
      sessions.length > 0
        ? sessions.reduce(
            (latest, session) =>
              session.updatedAt > latest ? session.updatedAt : latest,
            sessions[0].updatedAt,
          )
        : null;

    return {
      totalKeys: sessions.length,
      hasCredentials,
      lastUpdated,
    };
  } catch (error) {
    console.error('Erro ao obter estatísticas de autenticação:', error);
    return {
      totalKeys: 0,
      hasCredentials: false,
      lastUpdated: null,
    };
  }
};
