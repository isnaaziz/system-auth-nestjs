import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities/user.entity';
import { UserSession } from '../entities/user-session.entity';

describe('AuthController', () => {
    let controller: AuthController;
    let authService: AuthService;

    const mockUserRepository = {
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
    };

    const mockSessionRepository = {
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
        update: jest.fn(),
    };

    const mockJwtService = {
        sign: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                AuthService,
                {
                    provide: getRepositoryToken(User),
                    useValue: mockUserRepository,
                },
                {
                    provide: getRepositoryToken(UserSession),
                    useValue: mockSessionRepository,
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
            ],
        }).compile();

        controller = module.get<AuthController>(AuthController);
        authService = module.get<AuthService>(AuthService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('register', () => {
        it('should register a new user', async () => {
            const registerDto = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123',
                full_name: 'Test User',
            };

            const expectedResult = {
                access_token: 'jwt-token',
                refresh_token: 'refresh-token',
                user: { id: '1', username: 'testuser', email: 'test@example.com' },
                expires_in: 900,
            };

            jest.spyOn(authService, 'register').mockResolvedValue(expectedResult);

            const result = await controller.register(registerDto);

            expect(result).toBe(expectedResult);
            expect(authService.register).toHaveBeenCalledWith(registerDto);
        });
    });
});
