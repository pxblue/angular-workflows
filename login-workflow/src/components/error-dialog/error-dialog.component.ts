import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ErrorDialogData } from '../../services/dialog/error-dialog.service';

@Component({
    selector: 'pxb-auth-error-dialog',
    template: `
        <div class="mat-h2">{{ title }}</div>
        <div class="mat-subheading-2">{{ message }}</div>
        <div style="display: flex; justify-content: flex-end; margin-top: 24px;">
            <button mat-stroked-button (click)="dialogRef.close()">Okay</button>
        </div>
    `,
})
export class PxbAuthErrorDialogComponent implements OnInit {
    // These are the defaults when no ErrorDialogData is provided by users or our ErrorDialogServices.
    title = 'Error!';
    message = 'Unable to process your request.';

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: ErrorDialogData,
        public dialogRef: MatDialogRef<PxbAuthErrorDialogComponent>
    ) {}

    // Use ErrorDialogData values if they are provided by an ErrorDialogService or directly from the user via a catch block.
    ngOnInit(): void {
        this.title = this.data?.title || this.title;
        this.message = this.data?.message || this.message;
    }
}
