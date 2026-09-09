import { AlgorithmCatalogComponent } from './algorithm-catalog.component';

describe('Algorithm catalog', () => {
  it('combines category and trimmed case-insensitive searches', () => {
    const catalog = new AlgorithmCatalogComponent();
    catalog.query.set('  BFS ');
    expect(catalog.filtered().map(item => item.id)).toEqual(['bfs']);
    catalog.category.set('排序算法');
    expect(catalog.filtered()).toEqual([]);
    catalog.clear();
    expect(catalog.filtered().length).toBe(catalog.entries.length);
  });
  it('opens a category selected on the home page', () => {
    const catalog = new AlgorithmCatalogComponent();
    catalog.initialCategory = '排序算法';
    expect(catalog.filtered().length).toBe(5);
    expect(catalog.filtered().every(item => item.category === '排序算法')).toBeTrue();
  });
});
