import { render } from '@testing-library/react';

import WsService from './ws-service-provider';

describe('WsService', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<WsService />);
    expect(baseElement).toBeTruthy();
  });
});
