import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <h1>Angular + Electron</h1>
    <p>Backend test – check console</p>
  `
})
export class AppComponent implements OnInit {

  ngOnInit() {
    fetch('http://localhost:3001/health')
      .then(res => res.json())
      .then(data => console.log('Backend response:', data))
      .catch(err => console.error(err));
  }
}
