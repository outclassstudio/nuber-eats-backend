import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { UsersService } from './users.service';

//!각각의 레포지토리가 다르다는 것을 인식시키 위해 함수로 생성
const mockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  findOneOrFail: jest.fn(),
  delete: jest.fn(),
});

const mockJwtService = {
  sign: jest.fn(() => 'signed-token-baby'),
  verify: jest.fn(),
};

const mockMailService = {
  sendVerificationEmail: jest.fn(),
};

//!복습 필요
type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: MockRepository<User>;
  let verificationRepository: MockRepository<Verification>;
  let mailService: MailService;
  let jwtService: JwtService;

  //테스트 모듈 생성
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Verification),
          useValue: mockRepository(),
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
      ],
    }).compile();
    service = module.get<UsersService>(UsersService);
    mailService = module.get<MailService>(MailService);
    jwtService = module.get<JwtService>(JwtService);
    userRepository = module.get(getRepositoryToken(User));
    verificationRepository = module.get(getRepositoryToken(Verification));
  });

  it('Should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAccount', () => {
    const createAccountArgs = {
      email: 'abc@abc.com',
      password: '1234',
      role: 0,
    };

    it('should be fail if user exists', async () => {
      //TypeORM의 반환값을 임의로 지정
      userRepository.findOne.mockResolvedValue({
        id: 1,
        email: 'abcdabcd',
      });
      //createAccount실행 이전에 위 함수에서 리턴값을 정한 것
      const result = await service.createAccount(createAccountArgs);
      expect(result).toMatchObject({
        ok: false,
        error: 'There is a user with that email already',
      });
    });

    it('should be return a new user', async () => {
      //promise -> resolved value
      userRepository.findOne.mockResolvedValue(undefined);
      //promise아니면 -> return value
      userRepository.create.mockReturnValue(createAccountArgs);
      userRepository.save.mockReturnValue(createAccountArgs);

      verificationRepository.create.mockReturnValue({
        user: createAccountArgs,
      });
      verificationRepository.save.mockReturnValue({
        code: 'code',
      });

      const result = await service.createAccount(createAccountArgs);

      expect(userRepository.create).toHaveBeenCalledTimes(1);
      expect(userRepository.create).toHaveBeenCalledWith(createAccountArgs);

      expect(userRepository.save).toHaveBeenCalledTimes(1);
      expect(userRepository.save).toHaveBeenCalledWith(createAccountArgs);

      expect(verificationRepository.create).toHaveBeenCalledWith({
        user: createAccountArgs,
      });
      expect(verificationRepository.save).toHaveBeenCalledTimes(1);
      expect(verificationRepository.save).toHaveBeenCalledWith({
        user: createAccountArgs,
      });

      expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
      );

      expect(result).toEqual({ ok: true });
    });

    it('should fail on exception', async () => {
      //결과값을 미리 정해놓고
      userRepository.findOne.mockRejectedValue(new Error('아무에러'));
      //함수를 실행시킨후의 결과가
      const result = await service.createAccount(createAccountArgs);
      //우리가 기대한 결과와 같은지 비교한다
      expect(result).toEqual({ ok: false, error: "Couldn't create account" });
    });
  });

  describe('login', () => {
    const loginArgs = {
      email: 'abc@abc',
      password: '1234',
    };
    it('should be fain if user does not exist', async () => {
      userRepository.findOne.mockResolvedValue(null);
      const result = await service.login(loginArgs);
      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
      //!함수가 호출될 때 인자에 무엇이 들어가게 되는지
      //?아래는 두개의 Object가 인자로 들어간다는 것
      expect(userRepository.findOne).toHaveBeenCalledWith(expect.any(Object));
      expect(result).toEqual({
        ok: false,
        error: 'User nof found',
      });
    });

    it('should fail if the password is wrong', async () => {
      const mockedUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(false)),
      };
      userRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.login(loginArgs);
      expect(result).toEqual({
        ok: false,
        error: 'Wrong password',
      });
    });

    it('should return token if password correct', async () => {
      const mockedUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(true)),
      };
      userRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.login(loginArgs);
      expect(jwtService.sign).toHaveBeenCalledTimes(1);
      expect(jwtService.sign).toHaveBeenCalledWith(expect.any(Number));
      expect(result).toEqual({
        ok: true,
        token: 'signed-token-baby',
      });
    });

    it('should fail on exception', async () => {
      userRepository.findOne.mockRejectedValue(new Error('아무에러'));
      const result = await service.login(loginArgs);
      expect(result).toEqual({
        ok: false,
        error: new Error('아무에러'),
      });
    });
  });

  describe('findById', () => {
    it('should find an existing user', async () => {
      const findByIdArgs = {
        id: 1,
      };
      //?함수 사용전 mock했는지 확인 필요
      userRepository.findOneOrFail.mockResolvedValue(findByIdArgs);
      const result = await service.findById(1);
      expect(result).toEqual({
        ok: true,
        user: findByIdArgs,
      });
    });

    it('should fail if no user', async () => {
      userRepository.findOneOrFail.mockRejectedValue(new Error());
      const result = await service.findById(1);
      expect(result).toEqual({
        ok: false,
        error: '유저가 존재하지 않습니다',
      });
    });
  });

  describe('editProfile', () => {
    it('should change email', async () => {
      const oldUser = {
        email: 'abc@abc.com',
        verified: true,
      };
      const editProfileArgs = {
        userId: 1,
        input: { email: 'new@new.com' },
      };
      const newVerification = {
        code: 'code',
      };
      const newUser = {
        verified: false,
        email: editProfileArgs.input.email,
      };
      userRepository.findOne.mockResolvedValue(oldUser);
      verificationRepository.create.mockReturnValue(newVerification);
      verificationRepository.save.mockResolvedValue(newVerification);
      await service.editProfile(editProfileArgs.userId, editProfileArgs.input);
      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(verificationRepository.create).toHaveBeenCalledWith({
        user: newUser,
      });
      expect(verificationRepository.save).toHaveBeenCalledWith(newVerification);
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        newUser.email,
        newVerification.code,
      );
    });

    it('should change password', async () => {
      const editProfileArgs = {
        userId: 1,
        input: { password: 'newnew' },
      };
      userRepository.findOne.mockResolvedValue({ password: 'old' });
      const result = await service.editProfile(
        editProfileArgs.userId,
        editProfileArgs.input,
      );
      expect(userRepository.save).toHaveBeenCalledTimes(1);
      expect(userRepository.save).toHaveBeenCalledWith(editProfileArgs.input);
      expect(result).toEqual({
        ok: true,
      });
    });

    it('should fail on exception', async () => {
      userRepository.findOne.mockRejectedValue(new Error());
      const result = await await service.editProfile(1, {
        email: '바보',
        password: '메롱',
      });
      expect(result).toEqual({
        ok: false,
        error: '프로필을 업데이트 하지 못했어요',
      });
    });
  });

  describe('verifyEmail', () => {
    it('should verify email', async () => {
      const verificationArgs = {
        id: 1,
        user: {
          verified: false,
        },
      };
      verificationRepository.findOne.mockResolvedValue(verificationArgs);
      const result = await service.verifyEmail('coooode');
      expect(verificationRepository.findOne).toHaveBeenCalledTimes(1);
      expect(verificationRepository.findOne).toHaveBeenCalledWith(
        expect.any(Object),
      );
      expect(userRepository.save).toHaveBeenCalledTimes(1);
      expect(userRepository.save).toHaveBeenCalledWith({
        verified: true,
      });
      expect(verificationRepository.delete).toHaveBeenCalledTimes(1);
      expect(verificationRepository.delete).toHaveBeenCalledWith(
        verificationArgs.id,
      );

      expect(result).toEqual({
        ok: true,
      });
    });

    it('should fain on verification not found', async () => {
      verificationRepository.findOne.mockResolvedValue(undefined);
      const result = await service.verifyEmail('coooode');
      expect(result).toEqual({
        ok: false,
        error: 'Verification not found.',
      });
    });

    it('should fail on exception', async () => {
      verificationRepository.findOne.mockRejectedValue(new Error());
      const result = await service.verifyEmail('');
      expect(result).toEqual({
        ok: false,
        error: '인증에 실패했어요',
      });
    });
  });
});
