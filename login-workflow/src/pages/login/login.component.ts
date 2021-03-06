import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, ValidatorFn } from '@angular/forms';
import { isEmptyView } from '../../util/view-utils';
import { PxbAuthSecurityService } from '../../services/state/auth-security.service';
import { PxbAuthUIService } from '../../services/api';
import { AUTH_ROUTES } from '../../auth/auth.routes';
import { PxbAuthConfig } from '../../services/config/auth-config';
import { PxbLoginErrorDialogService } from '../../services/dialog/login-error-dialog.service';
import { ErrorDialogData } from '../../services/dialog/error-dialog.service';
import { PxbFormsService } from '../../services/forms/forms.service';
import { AuthTranslationLanguageCode, PxbAuthTranslations } from '../../translations/auth-translations';
import { EmailFieldComponent } from '../../components/email-field/email-field.component';
import { PasswordFieldComponent } from '../../components/password-field/password-field.component';

@Component({
    selector: 'pxb-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    host: {
        class: 'pxb-login',
    },
})
export class PxbLoginComponent implements OnInit, AfterViewInit {
    @Input() customEmailValidator: ValidatorFn;

    @ViewChild('header', { static: false }) headerEl: ElementRef;
    @ViewChild('footer', { static: false }) footerEl: ElementRef;
    @ViewChild(EmailFieldComponent) emailFieldComponent: EmailFieldComponent;
    @ViewChild(PasswordFieldComponent) passwordFieldComponent: PasswordFieldComponent;

    emailFormControl: FormControl;
    passwordFormControl: FormControl;

    isLoading: boolean;
    rememberMe: boolean;

    isPasswordVisible = false;
    debugMode = false;

    selectedLanguage = 'English';

    isEmpty = (el: ElementRef): boolean => isEmptyView(el);

    constructor(
        public pxbAuthConfig: PxbAuthConfig,
        private readonly _router: Router,
        private readonly _changeDetectorRef: ChangeDetectorRef,
        private readonly _pxbUIActionsService: PxbAuthUIService,
        private readonly _pxbSecurityService: PxbAuthSecurityService,
        private readonly _pxbLoginErrorDialogService: PxbLoginErrorDialogService,
        public pxbFormsService: PxbFormsService
    ) {}

    ngOnInit(): void {
        this.rememberMe = this._pxbSecurityService.getSecurityState().rememberMeDetails.rememberMe;
        if (this._pxbSecurityService.getSecurityState().isAuthenticatedUser) {
            this.navigateToDefaultRoute();
            return;
        }
    }

    ngAfterViewInit(): void {
        this.emailFormControl = this.emailFieldComponent.emailFormControl;
        this.passwordFormControl = this.passwordFieldComponent.passwordFormControl;
        this._changeDetectorRef.detectChanges();
    }

    togglePasswordVisibility(): void {
        this.isPasswordVisible = !this.isPasswordVisible;
    }

    toggleDebugMode(): void {
        this.debugMode = !this.debugMode;
    }

    login(): void {
        const email = this.emailFormControl.value;
        const password = this.passwordFormControl.value;
        const rememberMe = Boolean(this.rememberMe);
        this._pxbSecurityService.setLoading(true);
        this._pxbUIActionsService
            .login(email, password, rememberMe)
            .then(() => {
                this._pxbSecurityService.onUserAuthenticated(email, password, rememberMe);
                this.navigateToDefaultRoute();
                this._pxbSecurityService.setLoading(false);
            })
            .catch((data: ErrorDialogData) => {
                this._pxbLoginErrorDialogService.openDialog(data);
                this._pxbSecurityService.onUserNotAuthenticated();
                this._pxbSecurityService.setLoading(false);
            });
    }

    focusPasswordField(): void {
        this.pxbFormsService.advanceToNextField(this.passwordFieldComponent.passwordInputElement);
    }

    toggleRememberMe(): void {
        const rememberMe = this.rememberMe;
        this._pxbSecurityService.updateSecurityState({ rememberMeDetails: { rememberMe } });
    }

    navigateToDefaultRoute(): void {
        void this._router.navigate([AUTH_ROUTES.ON_AUTHENTICATED]);
    }

    forgotPassword(): void {
        void this._router.navigate([`${AUTH_ROUTES.AUTH_WORKFLOW}/${AUTH_ROUTES.FORGOT_PASSWORD}`]);
    }

    testForgotPasswordEmail(): void {
        void this._router.navigate([`${AUTH_ROUTES.AUTH_WORKFLOW}/${AUTH_ROUTES.RESET_PASSWORD}`], {
            queryParams: { code: 'DEADBEEF', email: 'resetPassword@email.com' },
        });
    }

    testInviteRegister(): void {
        void this._router.navigate([`${AUTH_ROUTES.AUTH_WORKFLOW}/${AUTH_ROUTES.CREATE_ACCOUNT_INVITE}`], {
            queryParams: { code: 'DEADBEEF' },
        });
    }

    createAccount(): void {
        void this._router.navigate([`${AUTH_ROUTES.AUTH_WORKFLOW}/${AUTH_ROUTES.CREATE_ACCOUNT}`]);
    }

    contactSupport(): void {
        void this._router.navigate([`${AUTH_ROUTES.AUTH_WORKFLOW}/${AUTH_ROUTES.CONTACT_SUPPORT}`]);
    }

    hasValidFormEntries(): boolean {
        return (
            this.passwordFormControl &&
            this.emailFormControl &&
            this.passwordFormControl.value &&
            this.emailFormControl.valid
        );
    }

    changeLanguage(languageCode: AuthTranslationLanguageCode): void {
        this.pxbAuthConfig.languageCode = languageCode;
    }

    translate(): PxbAuthTranslations {
        return this.pxbAuthConfig.getTranslations();
    }
}
