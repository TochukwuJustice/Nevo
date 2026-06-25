import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { Keypair } from '@stellar/stellar-sdk';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import { VerifyAuthDto } from './dto/verify-auth.dto';

jest.mock('@stellar/stellar-sdk', () => ({
  Keypair: {
    random: () => {
      const publicKey = `mock-public-key-${Math.random().toString(36).slice(2)}`;
      return {
        publicKey: () => publicKey,
        sign: (message: Buffer) =>
          Buffer.from(`${publicKey}:${message.toString('utf8')}`),
      };
    },
    fromPublicKey: (publicKey: string) => ({
      verify: (message: Buffer, signature: Buffer) => {
        const expected = Buffer.from(
          `${publicKey}:${message.toString('utf8')}`,
        );
        return signature.equals(expected);
      },
    }),
  },
}));

describe('AuthService', () => {
  const user: User = {
    id: 'uuid-1',
    publicKey: 'GBM3T7V2NNWJVSQ5Q7WPEMMO5G2E2UZY4D2Z24W73SHZJ2E4A5F2D3FZ',
    username: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const dto: VerifyAuthDto = {
    publicKey: user.publicKey,
    signature: '',
    nonce: 'nonce-123',
  };

  let service: AuthService;
  const findOrCreate = jest.fn().mockImplementation((publicKey: string) => ({
    ...user,
    publicKey,
  }));
  const sign = jest.fn().mockReturnValue('jwt-token');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: { findOrCreate } },
        { provide: JwtService, useValue: { sign } },
      ],
    }).compile();
    service = module.get(AuthService);
    findOrCreate.mockClear();
    sign.mockClear();
  });

  const buildDto = (
    nonce: string,
    publicKey: string,
    signature: string,
  ): VerifyAuthDto => ({
    ...dto,
    publicKey,
    nonce,
    signature,
  });

  it('returns accessToken on valid nonce and signature', async () => {
    const keypair = Keypair.random();
    const publicKey = keypair.publicKey();
    const nonce = service.createNonce(publicKey);
    const signature = keypair.sign(Buffer.from(nonce, 'utf8')).toString('hex');
    const result = await service.verify(buildDto(nonce, publicKey, signature));

    expect(sign).toHaveBeenCalledWith({ sub: publicKey });
    expect(result).toEqual({ accessToken: 'jwt-token' });
  });

  it('rejects an expired or missing nonce', async () => {
    await expect(service.verify(dto)).rejects.toThrow(
      'Nonce expired or not found',
    );
  });

  it('rejects invalid signatures', async () => {
    const keypair = Keypair.random();
    const publicKey = keypair.publicKey();
    const nonce = service.createNonce(publicKey);
    await expect(
      service.verify(buildDto(nonce, publicKey, '')),
    ).rejects.toThrow('Invalid signature');
  });

  it('consumes a nonce after first use', async () => {
    const keypair = Keypair.random();
    const publicKey = keypair.publicKey();
    const nonce = service.createNonce(publicKey);
    const signature = keypair.sign(Buffer.from(nonce, 'utf8')).toString('hex');
    await service.verify(buildDto(nonce, publicKey, signature));

    await expect(
      service.verify(buildDto(nonce, publicKey, signature)),
    ).rejects.toThrow('Nonce expired or not found');
  });

  it('returns true for a valid signature', () => {
    const keypair = Keypair.random();
    const message = 'hello';
    const signature = keypair.sign(Buffer.from(message)).toString('hex');

    expect(
      service.verifySignature(keypair.publicKey(), message, signature),
    ).toBe(true);
  });

  it('returns false for a tampered message', () => {
    const keypair = Keypair.random();
    const message = 'hello';
    const signature = keypair.sign(Buffer.from(message)).toString('hex');

    expect(
      service.verifySignature(keypair.publicKey(), 'world', signature),
    ).toBe(false);
  });

  it('returns false for a wrong public key', () => {
    const keypair = Keypair.random();
    const otherKeypair = Keypair.random();
    const message = 'hello';
    const signature = keypair.sign(Buffer.from(message)).toString('hex');

    expect(
      service.verifySignature(otherKeypair.publicKey(), message, signature),
    ).toBe(false);
  });
});
