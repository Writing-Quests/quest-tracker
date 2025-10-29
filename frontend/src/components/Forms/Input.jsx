import '@mdxeditor/editor/style.css'
import { forwardRef } from 'react'
import { MDXEditor, UndoRedo, BoldItalicUnderlineToggles, toolbarPlugin, CreateLink, ListsToggle, linkDialogPlugin, linkPlugin, listsPlugin, quotePlugin, markdownShortcutPlugin } from '@mdxeditor/editor'
import PropTypes from 'prop-types'
import styled from 'styled-components'

export const StandaloneLabel = styled.label`
  padding: 15px 5px;
  padding-bottom: 3px;
  display: block;
  font-size: 0.8rem;
  font-weight: bold;
  letter-spacing: 0.01rem;
  color: #333;
`

export const SectionOptions = styled.div`
  display: ${(props) => (props.hidden == true && 'none') || 'flex'};
  width: ${(props) => (props.size === 'small' && 'fit-content') || '100%'};
  background-color: transparent;
  margin: ${(props) => (props.size === 'small' && '5px 0') || '10px 0'};
  border: 1px solid #838686;
  border-radius: 3px;
  padding: 0;
  &[disabled] {
    border: 1px solid red;
  }
`

export const OptionButton = styled.button`
  padding: ${(props) => (props.size === 'small' && '8px 16px') || '15px 30px'};
  margin: ${props => props.selected ? '-4px -1px -4px -1px' : '0'};
  z-index: ${props => props.selected ? '1' : '0'};
  font-size: ${(props) => (props.size === 'small' && '0.75rem') || '1rem'};
  background-color: ${(props) => (props.selected === true && '#333') || 'white'};
  color: ${(props) => (props.selected === true && 'white') || '#333'};
  border: none;
  border-radius: 3px;
  display: inline-block;
  width: ${props => props.size === 'small' ? 'auto' : '100%'};
  font-weight: ${(props) => (props.selected === true && 'bold') || 'normal'};
  font-size: 1rem;
  cursor: pointer;
  position: relative;
  transition: background-color 0.1s, color 0.1s;
  top: 0;
  text-shadow: ${(props) => (props.selected === true && '-1px 1px 0 black') || 'none'};
  flex-grow: ${props => props.size === 'small' ? '0' : '1'};
  &:last-child {
    position: relative;
    right: ${(props) => props.selected ? '-2px' : 0};
  }
  &:disabled {
    text-decoration: line-through;
  }
`

const StyledTextInput = styled.input`
  width: 100%;
  font-size: 16px;
  padding: 0;
  position: relative;
  background: transparent;
  border: none;
  &:focus {
    outline: none;
  }
  &[readonly] {
    cursor: not-allowed;
  }
`

const StyledTextarea = styled.textarea`
  width: 100%;
  font-size: 16px;
  padding: 0;
  position: relative;
  background: transparent;
  border: none;
  margin-top: 6px;
  margin-bottom: 2px;
  &:focus {
    outline: none;
  }
`

const StyledSelect = styled.select`
  border: none;
  background: transparent;
  display: block;
  width: 100%;
  font-size: 16px;
  &[readonly] {
    cursor: not-allowed;
  }
  &:focus {
    outline: none;
  }
`

const Label = styled.label`
  border: 1px solid #C0C0C0;
  border-radius: 3px;
  background-color: white;
  padding: 10px 5px;
  display: block;
  font-size: 0.8rem;
  font-weight: bold;
  letter-spacing: 0.01rem;
  color: #333;
  &:focus-within {
    z-index: 1;
    outline: 2px solid rgba(0,0,0,0.5);
    color: black;
  }
  &[disabled]{
    cursor: not-allowed;
    opacity: 0.75;
  }
  &[readonly] {
    cursor: not-allowed;
    filter: brightness(0.8);
  }
`

const CTAButton = styled.button`
  width: 100%;
  padding: 15px 0;
  margin-top: 6px;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 3px;
  font-weight: bold;
  font-size: 1rem;
  border-bottom: 2px solid black;
  cursor: pointer;
  position: relative;
  transition: all 0.15s;
  margin-bottom: 2px;
  top: 0;
  text-shadow: -1px 1px 0 black;
  &[disabled]{
    cursor: not-allowed;
    opacity: 0.75;
  }
  &:not([disabled]):hover {
    border-bottom-width: 4px;
    top: -2px;
    background-color: #353535;
    margin-bottom: 0;
  }
  &:not([disabled]):active {
    border-bottom-width: 2px;
    top: 0;
    background-color: #252525;
    margin-bottom: 2px;
  }
`

const OutlineButton = styled.button`
  width: 100%;
  padding: 15px 0;
  margin-top: 6px;
  background-color: transparent;
  color: white;
  border: 1px solid white;
  border-radius: 3px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.15s;
  margin-bottom: 2px;
  &[disabled]{
    cursor: not-allowed;
    opacity: 0.75;
  }
  &:not([disabled]):hover {
    background-color: rgba(255, 255, 255, 0.1);
    outline: 1px solid white;
  }
  &:not([disabled]):active {
    background-color: rgba(255, 255, 255, 0.15);
    outline: 2px solid #252525;
  }
`

const NormalButton = styled.button`
  padding: 15px 20px;
  margin-top: 6px;
  background-color: transparent;
  color: #333;
  border: none;
  background-color: #e5e5e5;
  border-radius: 3px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.15s;
  margin-bottom: 2px;
  display: inline-block;
  text-decoration: none;
  &[disabled]{
    cursor: not-allowed;
    opacity: 0.75;
  }
  &:hover {
    background-color: #d5d5d5;
    text-decoration: none;
    color: #333;
  }
`

const SmallButton = styled.button`
  padding: 5px 10px;
  margin-top: 3px;
  background-color: transparent;
  color: #333;
  border: none;
  background-color: #e5e5e5;
  border-radius: 3px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.15s;
  margin-bottom: 2px;
  &[disabled]{
    cursor: not-allowed;
    opacity: 0.75;
  }
  &:hover {
    background-color: #d5d5d5;
  }

`

const LinkButton = styled.button`
  width: 100%;
  padding: 15px 0;
  margin-top: 6px;
  background-color: transparent;
  color: white;
  border: none;
  font-weight: normal;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.15s;
  margin-bottom: 2px;
  &[disabled]{
    cursor: not-allowed;
    opacity: 0.75;
  }
  &:not([disabled]):hover {
    text-decoration: underline;
  }
`

function TextareaInput({ elStyle, label, ...props }) {
  return <Label style={elStyle} disabled={props.disabled}>
    <span style={{ position: 'relative', top: '-4px' }}>{label}</span>
    <StyledTextarea {...props}></StyledTextarea>
  </Label>
}
TextareaInput.propTypes = {
  elStyle: PropTypes.object,
  label: PropTypes.string,
  disabled: PropTypes.bool,
}

function MarkdownTextarea({ label, elStyle, ...props }) {
  const divStyle = {
    'border': '1px solid #C0C0C0',
    'borderRadius': '3px',
    'backgroundColor': 'white',
    'padding': '10px 5px',
    'display': 'block',
    'letterSpacing': '0.01rem',
    'color': '#333'
  }
  const style = {
    'width': '100%',
    'fontSize': '16px',
    'fontWeight': 'normal',
    'padding': 0,
    'position': 'relative',
    'background': 'transparent',
    'border': 'none',
    'marginTop': '6px',
    'marginBottom': '2px'
  }
  const plugins = [toolbarPlugin({
    toolbarClassName: 'dmToolbar',
    toolbarContents: () => (
      <>
        <BoldItalicUnderlineToggles />
        <CreateLink />
        <ListsToggle />
        <UndoRedo />
      </>
        )
      }),
      markdownShortcutPlugin(),
      linkPlugin(),
      linkDialogPlugin(),
      listsPlugin(),
      quotePlugin()]
  return <div style={divStyle}>
    <span style={{ position: 'relative', top: '-4px', 'fontSize': '0.8rem', 'fontWeight': 'bold' }}>{label}</span>
    <MDXEditor style={style} plugins={plugins} markdown={props.markdown || ''} {...props} />
  </div>
}
TextareaInput.propTypes = {
  elStyle: PropTypes.object,
  label: PropTypes.string,
  disabled: PropTypes.bool,
}

function TextInput({ elStyle, label, style, inputStyle, ...props }) {
  return <Label style={{ ...elStyle, ...style }} disabled={props.disabled} readOnly={props.readOnly}>
    <span style={{ position: 'relative', top: '-4px' }}>{label}</span>
    <StyledTextInput style={inputStyle} {...props} />
  </Label>
}
TextInput.propTypes = {
  elStyle: PropTypes.object,
  label: PropTypes.string,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  style: PropTypes.object,
  inputStyle: PropTypes.string,
}

// eslint-disable-next-line no-unused-vars
function ButtonInput({ elStyle, label: _, buttonType = 'normal', type, ...props }) {
  let value = props.value
  if (props.isLoading) {
    value = 'Loading…'
  }
  return <Button type={buttonType} inputType={type} as="input" style={elStyle} {...props} value={value} />
}
ButtonInput.propTypes = {
  elStyle: PropTypes.object,
  label: PropTypes.string,
  value: PropTypes.string,
  isLoading: PropTypes.bool,
  buttonType: PropTypes.string,
  type: PropTypes.string,
}

function SelectInput({ elStyle, label, style, children, ...props }) {
  return <Label style={{ ...elStyle, ...style }} disabled={props.disabled} readOnly={props.readOnly}>
    <span style={{ position: 'relative', top: '-4px' }}>{label}</span>
    <StyledSelect {...props}>
      {children}
    </StyledSelect>
  </Label>
}
SelectInput.propTypes = {
  elStyle: PropTypes.object,
  label: PropTypes.string,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  style: PropTypes.object,
  children: PropTypes.node,
}

function ButtonSelectInput({ elStyle, label, style, disabled, readOnly, options, value, onChange }) {
  return <Label style={{ ...elStyle, ...style }} disabled={disabled} readOnly={readOnly}>
    <span style={{ position: 'relative', top: '-4px' }}>{label}</span>
    <SectionOptions size='small' {...elStyle}>
      {options.map(o =>
        <OptionButton
          size='small'
          key={o.value}
          selected={value === o.value}
          data-selected={value === o.value}
          onClick={e => { e.preventDefault(); onChange(o.value) }}
          disabled={o.disabled}
        >{o.label}</OptionButton>
      )}
    </SectionOptions>
  </Label>
}
ButtonSelectInput.propTypes = {
  elStyle: PropTypes.object,
  label: PropTypes.string,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  style: PropTypes.object,
  options: PropTypes.array.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
}

export default function Input({ grouped, firstInGroup, lastInGroup, isLoading, disabled, ...props }) {
  const elStyle = {}
  if (grouped) {
    if (firstInGroup) {
      elStyle.borderBottomRightRadius = 0
      elStyle.borderBottomLeftRadius = 0
      elStyle.borderBottom = 'none'
    } else if (lastInGroup) {
      elStyle.borderTopLeftRadius = 0
      elStyle.borderTopRightRadius = 0
    } else {
      elStyle.borderRadius = 0
      elStyle.borderBottom = 'none'
    }
  }
  const sharedProps = { disabled: disabled || isLoading }
  switch (props.type) {
    case 'select':
      return <SelectInput elStyle={elStyle} {...props} {...sharedProps} />
    case 'button-select':
      return <ButtonSelectInput elStyle={elStyle} {...props} {...sharedProps} />
    case 'submit':
      return <ButtonInput elStyle={elStyle} isLoading={isLoading} buttonType={props.buttonType || 'cta'} {...props} {...sharedProps} />
    case 'textarea':
      return <TextareaInput elStyle={elStyle} {...props} {...sharedProps} />
    case 'markdown':
      return <MarkdownTextarea elStyle={elStyle} {...props} {...sharedProps} />
    case 'hidden':
      return <input type="hidden" {...props} {...sharedProps} />
    case 'text':
    case 'password':
    case 'email':
    default:
      return <TextInput elStyle={elStyle} {...props} {...sharedProps} />
  }
}

Input.propTypes = {
  label: PropTypes.string,
  grouped: PropTypes.bool,
  firstInGroup: PropTypes.bool,
  lastInGroup: PropTypes.bool,
  type: PropTypes.string.isRequired,
  isLoading: PropTypes.bool,
  disabled: PropTypes.bool,
  buttonType: PropTypes.string,
}

// Including isLoading in destructured properties to remove it from being passed to the button DOM element (and making React mad)
//eslint-disable-next-line react/prop-types, no-unused-vars
export function Button({ type, inputType, isLoading, ...props }) {
  switch (type) {
    case 'outline':
      return <OutlineButton type={inputType} {...props} />
    case 'cta':
      return <CTAButton type={inputType} {...props} />
    case 'link':
      return <LinkButton type={inputType} {...props} />
    case 'small':
      return <SmallButton type={inputType} {...props} />
    default:
    case 'normal':
      return <NormalButton type={inputType} {...props} />
  }
}
Button.propTypes = {
  type: PropTypes.string,
  inputType: PropTypes.string,
}
