import { Component } from '@angular/core';
import { CommonModule, KeyValuePipe } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTreeModule, MatTreeNestedDataSource } from '@angular/material/tree';
import { FilesResponse, FilesTreeNode, SongFile } from '../types';
import { NestedTreeControl } from '@angular/cdk/tree';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatBottomSheet,
  MatBottomSheetModule,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { AddFormSheet } from './add-form.component';

const API = 'http://localhost:8000/';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatTreeModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatBottomSheetModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Songs';

  query = '';
  queryTimeout: undefined;

  activeFile: SongFile | undefined;
  files: FilesTreeNode[] = [];
  treeControl = new NestedTreeControl<FilesTreeNode>(node => node.children);
  dataSource = new MatTreeNestedDataSource<FilesTreeNode>();

  editorContent = '';

  constructor(private http: HttpClient, private bottomSheet: MatBottomSheet) {
    this.update();
  }

  filterFiles() {
    if (this.queryTimeout) {
      clearTimeout(this.queryTimeout);
    }

    setTimeout(() => {
      if (this.query !== '') {
        this.dataSource.data = this.filter(this.files);
        this.treeControl.dataNodes = this.dataSource.data;
        this.treeControl.expandAll();
      }
    }, 500);
  }
  filter(nodes: FilesTreeNode[]): FilesTreeNode[] {
    return nodes.filter(n => {
      if (n.f.name.includes(this.query) || (!!n.children && n.children.length > 0)) {
        return true;
      }
      return false;
    }).map(n => {
      if (n.children) {
        return {
          f: n.f,
          children: this.filter(n.children)
        };
      }
      return n;
    })
  }

  hasChild(_: number, node: FilesTreeNode) {
    return !!node.children && node.children.length > 0;
  };

  update() {
    this.http.get<FilesResponse>(API).subscribe(res => {
      this.files = [];
      Object.keys(res).forEach(key => {
        const r: FilesTreeNode = {
          f: {
            name: key
          },
          children: res[key].map(f => {
            return  {
              f: this.parseFile(key, f)
            }
          })
        };

        this.files.push(r);
      });

      this.dataSource.data = this.files;
      this.treeControl.dataNodes = this.dataSource.data;
      this.treeControl.expandAll();
    });
  }

  parseFile(parent: string, f: string, content: string | undefined = undefined): SongFile {
    return {
      name: f.replace('.txt', ''),
      fileName: `${parent}/${f}`,
      content,
    }
  }

  addFile(dir: string) {
    const form = this.bottomSheet.open(AddFormSheet);
    form.afterDismissed().subscribe(res => {
      if (res) {
        this.activeFile = {
          name: res,
          fileName: `${dir}/${res}.txt`,
          content: ''
        };
        
        const node = this.files.find(v => v.f.name == dir);
        if (node && node.children) {
          node.children.push({f: this.activeFile});
          this.dataSource.data = [];
          this.dataSource.data = this.files;
          this.treeControl.dataNodes = this.dataSource.data;
          this.query = '';
        }
      }
    })
  }

  openFile(f: SongFile) {
    if (f.content !== '') {
      this.http.get<{content: string}>(`${API}?file-path=${f.fileName}`).subscribe(res => {
        f.content = res.content;
        this.activeFile = f;
      });
    } else {
      this.activeFile = f;
    }
  }

  saveFile() {
    this.http.post<{content: string}>(`${API}?file-path=${this.activeFile?.fileName}`, {
      file: this.activeFile?.fileName,
      content: this.activeFile?.content
    }).subscribe(res => {
      if (this.activeFile) {
        this.activeFile.content = res.content;
      }
      this.activeFile = undefined;
    });
  }

  deleteFile(event: MouseEvent, f: SongFile) {
    event.stopPropagation();
    this.http.delete<{done: boolean}>(`${API}?file-path=${f.fileName}`).subscribe(res => {
      if (res.done) {
        this.update();
      }
    });
  }
}
