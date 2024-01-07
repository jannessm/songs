import { Component } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatBottomSheetRef } from "@angular/material/bottom-sheet";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";

@Component({
    selector: 'add-form-sheet',
    templateUrl: 'add-form.component.html',
    standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
    ],
  })
  export class AddFormSheet {
    name = '';

    constructor(private bottomSheetRef: MatBottomSheetRef<AddFormSheet>) {}
  
    cancel(): void {
        this.bottomSheetRef.dismiss();
    }

    addFile() {
        this.bottomSheetRef.dismiss(this.name);
    }
  }