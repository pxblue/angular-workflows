import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'pxb-create-account-invite-error-dialog',
    template: `
        <div class="mat-h2">Error!</div>
        <div class="mat-subheading-2">Sorry, there was a problem sending your request.</div>
        <div style="display: flex; justify-content: flex-end; margin-top: 24px;">
            <button mat-stroked-button (click)="dialogRef.close()">Okay</button>
        </div>
    `,
})
export class PxbCreateAccountInviteDialogComponent {
    constructor(public dialogRef: MatDialogRef<PxbCreateAccountInviteDialogComponent>) {}
}