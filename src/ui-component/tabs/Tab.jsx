
import { styled } from '@mui/system'
import { buttonClasses } from '@mui/base/Button'
import { Tab as BaseTab, tabClasses } from '@mui/base/Tab'
import { purple } from './tabColors'

export const Tab = styled(BaseTab)(
    ({ ...props }) => `
  font-family: 'Inter', 'Roboto', sans-serif;
  color: white;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: transparent;
  width: 100%;
  line-height: 1.5;
  padding: 8px 12px;
  margin: 6px;
  border: none;
  border-radius: 25px;
  display: flex;
  justify-content: center;

  &:hover {
    background-color: ${props.sx?.backgroundColor || purple[400]};
  }

  &:focus {
    color: #fff;
    outline: 3px solid ${props.sx?.backgroundColor || purple[200]};
  }

  &.${tabClasses.selected} {
    background-color: #fff;
    color: ${purple[600]};
    font-weight: 600;
  }

  &.${buttonClasses.disabled} {
    opacity: 0.5;
    cursor: not-allowed;
  }
 `
)
