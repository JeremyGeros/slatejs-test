import React, { Component } from 'react';
import {Editor, Raw} from 'slate';
import './App.css';
import state from './state';
import EditList from 'slate-edit-list'
import EditTable from 'slate-edit-table'
import Draggable from 'react-draggable'; // The default


let editList = EditList({types: ["numbered-list", "bulleted-list"], typeItem: "list-item"})
let editTable = EditTable({typeRow: 'table-row', typeCell: 'table-cell'})

const plugins = [
  editList,
  editTable,
]

const DEFAULT_NODE = 'paragraph'


/* NODES */
function headingOneNode(props) {
  return <h1 {...props.attributes}>{props.children}</h1>
}
function headingTwoNode(props) {
  return <h2 {...props.attributes}>{props.children}</h2>
}
function blockquoteNode(props) {
  return <blockquote {...props.attributes}>{props.children}</blockquote>
}
function bulletedListNode(props) {
  return <ul {...props.attributes}>{props.children}</ul>
}
function numberedListNode(props) {
  return <ol {...props.attributes}>{props.children}</ol>
}
function listItemNode(props) {
  return <li {...props.attributes}>{props.children}</li>
}


class CheckListItem extends React.Component {

  /**
   * On change, set the new checked value on the block.
   *
   * @param {Event} e
   */

  onChange = (e) => {
    const checked = e.target.checked
    const { editor, node } = this.props
    const state = editor
      .getState()
      .transform()
      .setNodeByKey(node.key, { data: { checked }})
      .apply()

    editor.onChange(state)
  }

  /**
   * Render a check list item, using `contenteditable="false"` to embed the
   * checkbox right next to the block's text.
   *
   * @return {Element}
   */

  render = () => {
    const { attributes, children, node } = this.props
    const checked = node.data.get('checked')
    return (
      <div
        className="check-list-item"
        contentEditable={false}
        {...attributes}
      >
        <span>
          <input
            type="checkbox"
            checked={checked}
            onChange={this.onChange}
          />
        </span>
        <span contentEditable suppressContentEditableWarning>
          {children}
        </span>
      </div>
    )
  }

}

class ImageItem extends Component {

  onDrag = (e, data) => {
    // console.log(data)
    const {editor, node} = this.props
    // console.log(node.data.merge)
    let nodeData = node.data.merge({width: node.data.get('width') + data.deltaX, height: node.data.get('height') + data.deltaY})
    let state = editor
      .getState()
      .transform()
      .setNodeByKey(node.key, {data: nodeData.toJS()})
      .apply()
    editor.onChange(state)
  }

  render = () => {
    const { node, state } = this.props
    const active = state.isFocused && state.selection.hasEdgeIn(node)
    const src = node.data.get('src')
    let  className = active ? 'active' : ''

    if (active) {
      return (
        <div className="image-resizable active">
          <img src={src} width={node.data.get('width')} height={node.data.get('height')} className={className} {...this.props.attributes} />
          <div className="resizable">
            <Draggable onDrag={this.onDrag}><div className="top-left-handle handle"/></Draggable>
            <Draggable onDrag={this.onDrag}><div className="top-right-handle handle"/></Draggable>
            <Draggable onDrag={this.onDrag}><div className="bottom-left-handle handle"/></Draggable>
            <Draggable onDrag={this.onDrag}><div className="bottom-right-handle handle"/></Draggable>
          </div>
        </div>
      )
    } else {
      return (
        <img src={src} width={node.data.get('width')} height={node.data.get('height')} className={className} {...this.props.attributes} />
      )
    }
  }
}

const chars = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H','I']

function tableNode(props) {
  let rowsCount = props.node.nodes.size
  let columnCount = props.node.nodes.first().nodes.size
  console.log('rows:', rowsCount, 'columns:', columnCount)

  let colgroups = []
  let cols = []
  Array.from(Array(columnCount)).forEach((x, i) => {
    colgroups.push(<col style={{width: '120px'}} />)
    cols.push(<th>{chars[i]}</th>)
  });

  let table = <table>
    <colgroup>
      {colgroups}
    </colgroup>
    <tbody {...props.attributes}>{props.children}</tbody>
  </table>

  let colHeaders = null
  if (props.state.selection.hasFocusIn(props.node)) {
    
    colHeaders = <div contentEditable={false} className="table-columms">
      <table>
        <colgroup>
          {colgroups}
        </colgroup>
        <thead>
          <tr>
            {cols}
          </tr>
        </thead>
      </table>
    </div>
  }

  let rowHeaders = null
  if (props.state.selection.hasFocusIn(props.node)) {
    let rows = []

    Array.from(Array(rowsCount)).forEach((x, i) => {
      rows.push(<tr><th>{i + 1}</th></tr>)
    });

    rowHeaders = <div contentEditable={false} className="table-rows">
      <table>
        <colgroup>
          <col style={{width: '20px'}} />
        </colgroup>
        <thead>
          {rows}
        </thead>
      </table>
    </div>
  }

  return (<div className="table-wrapper">
    {colHeaders}
    {rowHeaders}
    {table}
  </div>)
}
function tableRowNode(props) {
  return <tr {...props.attributes}>{props.children}</tr>
}
function tableCellNode(props) {
  return <td {...props.attributes}>{props.children}</td>
}
/* END NODES */

/* ------------------ */

/* MARKS */
function boldMark(props) {
  return <strong>{props.children}</strong>
}
function italicMark(props) {
  return <em>{props.children}</em>
}
function codeMark(props) {
  let codeStyle = {
    fontFamily: 'monospace',
    backgroundColor: '#eee', 
    padding: '3px',
    borderRadius: '4px',
  }

  return <span style={codeStyle}>{props.children}</span>
}
function underlinedMark(props) {
  let underlinedStyle = {
    textDecoration: 'underline'
  }
  
  return <span style={underlinedStyle}>{props.children}</span>
}
/* END MARKS */


const schema = {
  nodes: {
    'heading-one': headingOneNode,
    'heading-two': headingTwoNode,
    'block-quote': blockquoteNode,
    'bulleted-list': bulletedListNode,
    'numbered-list': numberedListNode,
    'list-item': listItemNode,
    'table': tableNode,
    'table-row': tableRowNode,
    'table-cell': tableCellNode,
    'image': ImageItem,
    'check-list-item': CheckListItem,
  },
  marks: {
    bold: boldMark,
    code: codeMark,
    italic: italicMark,
    underlined: underlinedMark,
  }
}




class App extends Component {

  state = {
    editorState: Raw.deserialize(JSON.parse(localStorage.getItem('content')) || state, {terse: true})
  }

  onChange = (editorState) => {
    this.setState({editorState})
  }

  onDocumentChange = (document, state) => {
     // Switch to using the Raw serializer.
     const content = JSON.stringify(Raw.serialize(state))
     localStorage.setItem('content', content)
   }



  hasMark = (type) => {
    const { editorState } = this.state
    return editorState.marks.some(mark => mark.type == type)
  }

  hasBlock = (type) => {
    const { editorState } = this.state
    return editorState.blocks.some(node => node.type == type)
  }

  onKeyDown = (e, data, editorState) => {
    if (data.key == 'enter' && editorState.startBlock.type == 'check-list-item') {
      return editorState
        .transform()
        .splitBlock()
        .setBlock({ data: { checked: false }})
        .apply()

    }

    if (
      data.key == 'backspace' &&
      editorState.isCollapsed &&
      editorState.startBlock.type == 'check-list-item' &&
      editorState.selection.startOffset == 0
    ) {
      return editorState
        .transform()
        .setBlock('paragraph')
        .apply()
    }

    if (!data.isMod) return
    let mark

    switch (data.key) {
      case 'b':
        mark = 'bold'
        break
      case 'i':
        mark = 'italic'
        break
      case 'u':
        mark = 'underlined'
        break
      case '`':
        mark = 'code'
        break
      default:
        return
    }

    editorState = editorState
      .transform()
      .toggleMark(mark)
      .apply()

    e.preventDefault()
    return editorState
  }

  insertImage = (editorState, src) => {
    return editorState
      .transform()
      .insertBlock({
        type: 'image',
        isVoid: true,
        data: { src, width: 300, height: 300 }
      })
      .apply()
  }

  onClickImage = (e) => {
    e.preventDefault()
    const src = window.prompt('Enter the URL of the image:')
    if (!src) return
    let { editorState } = this.state
    editorState = this.insertImage(editorState, src)
    this.onChange(editorState)
  }

  onClickMark = (e, type) => {
    e.preventDefault()
    let { editorState } = this.state

    editorState = editorState
      .transform()
      .toggleMark(type)
      .apply()

    this.setState({ editorState })
  }

  onClickBlock = (e, type) => {
    e.preventDefault()
    let { editorState } = this.state
    let transform = editorState.transform()
    const { document } = editorState

    // Handle the extra wrapping required for list buttons.
    if (type == 'bulleted-list' || type == 'numbered-list') {
      const isList = editList.utils.isSelectionInList(editorState)
      const isType = editorState.blocks.some((block) => {
        return !!document.getClosest(block.key, parent => parent.type == type)
      })

      if (isList && isType) {
        editList.transforms.unwrapList(transform)
      } else if (isList) {
        let otherType = type == 'bulleted-list' ? 'numbered-list' : 'bulleted-list'
        let listNode = null;

        editorState.blocks.forEach((block) => {
          listNode = document.getClosest(block.key, parent => parent.type == otherType)
          return !listNode
        })

        if (listNode) {
          transform.setNodeByKey(listNode.key, type)
        }
      } else {
        editList.transforms.wrapInList(transform.setBlock('list-item'), type)
      }
    } 

    else if (type == "table") {
      const isTable = editTable.utils.isSelectionInTable(editorState)
      if (isTable) {
        editTable.transforms.removeTable(transform)
      } else {
        editTable.transforms.insertTable(transform, 2, 2)
      }
    }

    else if (type == "insertRow") {
      const isTable = editTable.utils.isSelectionInTable(editorState)
      if (isTable) {
        editTable.transforms.insertRow(transform)
      }
    }
    else if (type == "insertColumn") {
      const isTable = editTable.utils.isSelectionInTable(editorState)
      if (isTable) {
        editTable.transforms.insertColumn(transform)
      }
    }
    // Handle everything but list buttons.
    else {
      const isActive = this.hasBlock(type)
      const isList = this.hasBlock('list-item')

      if (isList) {
        transform
          .setBlock(isActive ? DEFAULT_NODE : type)
          .unwrapBlock('bulleted-list')
          .unwrapBlock('numbered-list')
      }

      else {
        transform
          .setBlock(isActive ? DEFAULT_NODE : type)
      }
    }

    

    editorState = transform.apply()
    this.setState({ editorState })
  }

  renderBlockButton = (type, icon) => {
    const isActive = this.hasBlock(type)
    const onMouseDown = e => this.onClickBlock(e, type)

    return (
      <span className="button" onMouseDown={onMouseDown} data-active={isActive}>
        <span className="material-icons">{icon}</span>
      </span>
    )
  }

  renderMarkButton = (type, icon) => {
    const isActive = this.hasMark(type)
    const onMouseDown = e => this.onClickMark(e, type)

    return (
      <span className="button" onMouseDown={onMouseDown} data-active={isActive}>
        <span className="material-icons">{icon}</span>
        {type}
      </span>
    )
  }

  renderToolbar = () => {
    return (
      <div className="menu toolbar-menu">
        {this.renderMarkButton('bold', 'format_bold')}
        {this.renderMarkButton('italic', 'format_italic')}
        {this.renderMarkButton('underlined', 'format_underlined')}
        {this.renderMarkButton('code', 'code')}
        {this.renderBlockButton('heading-one', 'looks_one')}
        {this.renderBlockButton('heading-two', 'looks_two')}
        {this.renderBlockButton('block-quote', 'format_quote')}
        {this.renderBlockButton('numbered-list', 'format_list_numbered')}
        {this.renderBlockButton('bulleted-list', 'format_list_bulleted')}
        {this.renderBlockButton('table', 'view_module')}
        {this.renderBlockButton('insertRow', 'keyboard_arrow_down')}
        {this.renderBlockButton('insertColumn', 'keyboard_arrow_right')}
        {this.renderBlockButton('check-list-item', 'check_circle')}
        <span className="button" onMouseDown={this.onClickImage}>
          <span className="material-icons">image</span>
        </span>
      </div>
    )
  }


  render = () => {
    return (
      <div className="editor-outline">
        {this.renderToolbar()}
        <Editor 
          className="editor"
          spellCheck
          placeholder={'Enter some rich text...'}
          schema={schema}
          state={this.state.editorState}
          onChange={this.onChange}
          onKeyDown={this.onKeyDown}
          plugins={plugins}
          onDocumentChange={this.onDocumentChange}
        />
      </div>
    )
  }
}




export default App;
