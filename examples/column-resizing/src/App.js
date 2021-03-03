import React, { useState, useRef } from 'react'
import styled from 'styled-components'
import { useTable, useBlockLayout, useResizeColumns } from 'react-table'
import NewWindow from 'react-new-window'

import makeData from './makeData'

const Styles = styled.div`
  padding: 1rem;

  .table {
    display: inline-block;
    border-spacing: 0;
    border: 1px solid black;

    .tr {
      :last-child {
        .td {
          border-bottom: 0;
        }
      }
    }

    .th,
    .td {
      margin: 0;
      padding: 0.5rem;
      border-bottom: 1px solid black;
      border-right: 1px solid black;

      ${'' /* In this example we use an absolutely position resizer,
       so this is required. */}
      position: relative;

      :last-child {
        border-right: 0;
      }

      .resizer {
        display: inline-block;
        background: blue;
        width: 10px;
        height: 100%;
        position: absolute;
        right: 0;
        top: 0;
        transform: translateX(50%);
        z-index: 1;
        ${'' /* prevents from scrolling while dragging on touch devices */}
        touch-action:none;

        &.isResizing {
          background: red;
        }
      }
    }
  }
`

function Table({ columns, data, detached, setDetached }) {
  const tableRef = useRef();

  const defaultColumn = React.useMemo(
    () => ({
      minWidth: 30,
      width: 150,
      maxWidth: 400,
    }),
    []
  )

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state,
    resetResizing,
  } = useTable(
    {
      columns,
      data,
      defaultColumn,
      tableRef,
    },
    useBlockLayout,
    useResizeColumns
  )

  const Component = (
    <>
      <button onClick={resetResizing}>Reset Resizing</button>
      {detached ? null : (<button onClick={() => setDetached(true)}>Detach</button>)}
      <div ref={tableRef}>
        <div {...getTableProps()} className="table">
          <div>
            {headerGroups.map(headerGroup => (
              <div {...headerGroup.getHeaderGroupProps()} className="tr">
                {headerGroup.headers.map(column => (
                  <div {...column.getHeaderProps()} className="th">
                    {column.render('Header')}
                    {/* Use column.getResizerProps to hook up the events correctly */}
                    <div
                      {...column.getResizerProps()}
                      className={`resizer ${
                        column.isResizing ? 'isResizing' : ''
                      }`}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div {...getTableBodyProps()}>
            {rows.map((row, i) => {
              prepareRow(row)
              return (
                <div {...row.getRowProps()} className="tr">
                  {row.cells.map(cell => {
                    return (
                      <div {...cell.getCellProps()} className="td">
                        {cell.render('Cell')}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <pre>
        <code>{JSON.stringify(state, null, 2)}</code>
      </pre>
    </>
  )

  return detached ? (
    <NewWindow
      title='Detached table'
      name='Detached table'
      onUnload={() => setDetached(false)}
      features={{ width: 800, height: 800 }}
      center="parent"
    >
      <Styles>
        {Component}
      </Styles>
    </NewWindow>
  ) : Component
}

function App() {
  const columns = React.useMemo(
    () => [
      {
        Header: 'Name',
        columns: [
          {
            Header: 'First Name',
            accessor: 'firstName',
          },
          {
            Header: 'Last Name',
            accessor: 'lastName',
          },
        ],
      },
      {
        Header: 'Info',
        columns: [
          {
            Header: 'Age',
            accessor: 'age',
            width: 50,
          },
          {
            Header: 'Visits',
            accessor: 'visits',
            width: 60,
          },
          {
            Header: 'Status',
            accessor: 'status',
          },
          {
            Header: 'Profile Progress',
            accessor: 'progress',
          },
        ],
      },
    ],
    []
  )

  const data = React.useMemo(() => makeData(10), [])
  const [ detached, setDetached ] = useState(false)

  return (
    <Styles>
      <Table columns={columns} data={data} detached={detached} setDetached={setDetached}/>
    </Styles>
  )
}

export default App
