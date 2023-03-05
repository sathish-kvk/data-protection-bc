import { ExportAgreementPage } from './app.po';

describe('export-agreement App', function() {
  let page: ExportAgreementPage;

  beforeEach(() => {
    page = new ExportAgreementPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
