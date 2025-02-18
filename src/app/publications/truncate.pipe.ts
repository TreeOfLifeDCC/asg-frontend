import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate',
  standalone: true
})
export class TruncatePipe implements PipeTransform {
  transform(value: string, wordLimit: number): string {
    if (!value) return '';
    const div = document.createElement('div');
    div.innerHTML = value;
    const textContent = div.textContent || div.innerText || '';
    const words = textContent.split(' ');
    if (words.length <= wordLimit) {
      return value;
    }
    const truncated = words.slice(0, wordLimit).join(' ') + '...';
    return truncated;
  }
}
