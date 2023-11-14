import React from 'react';
import PropTypes from 'prop-types';
//import PerfectScrollbar from 'react-perfect-scrollbar';
import { makeStyles } from '@mui/styles';
import {
  CssBaseline,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Button,
  Typography,
  TextField
} from '@mui/material';
import MaUTable from '@mui/material/Table'
//import {matchSorter} from 'match-sorter'
import ArrowPreviousIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIcon from '@mui/icons-material/ArrowForwardIos';

// import PerfectScrollbar from 'react-perfect-scrollbar'

//REQUIRED FOR REACT-TABLE
import { useTable, useGlobalFilter, useSortBy, usePagination } from "react-table";

const useStyles = makeStyles((theme) => ({
  root: {},
  filterButton: {
    marginRight: theme.spacing(2)
  },
  card: {
    marginTop: '2rem'
  },
  content: {
    padding: 0
  },
  inner: {
    minWidth: 1150
  },
  actions: {
    padding: theme.spacing(0, 1),
    justifyContent: 'flex-end'
  },
  paginationButton: {
    margin: '1rem'
  }

}));

// const paymentStatusColors = {
//   canceled: colors.grey[600],
//   pending: colors.orange[600],
//   completed: colors.green[600],
//   rejected: colors.red[600]
// };

function Results({ className, columns, data, history, ...rest }) {
  const classes = useStyles();
  // const [filterInput, setFilterInput] = useState('')


  // function fuzzyTextFilterFn(rows, id, filterValue) {
  //   return matchSorter(rows, filterValue, { keys: [row => row.values[id]] })
  // }
  
  // // Let the table remove the filter if the string is empty
  // fuzzyTextFilterFn.autoRemove = val => !val

  // const filterTypes = useMemo(
  //   () => ({
  //     // Add a new fuzzyTextFilterFn filter type.
  //     fuzzyText: fuzzyTextFilterFn,
  //     // Or, override the default text filter to use
  //     // "startWith"
  //     text: (rows, id, filterValue) => {
  //       return rows.filter(row => {
  //         const rowValue = row.values[id]
  //         return rowValue !== undefined
  //           ? String(rowValue)
  //               .toLowerCase()
  //               .startsWith(String(filterValue).toLowerCase())
  //           : true
  //       })
  //     },
  //   }),
  //   []
  // )


  //USE TABLE HOOK TO GET PROPS
  const {
    getTableProps, // table props from react-table
    getTableBodyProps, // table body props from react-table
    headerGroups, // headerGroups if your table have groupings
    rows, // rows for the table based on the data passed
    prepareRow, // Prepare the row (this function need to called for each row before getting the row props)
    //setGlobalFilter, //the useFilter hook provides a way to set the filter
    pageOptions,
    //page,
    state: { 
      pageIndex, 
      //pageSize 
    },
    // gotoPage,
    previousPage,
    nextPage,
    setPageSize,
    canPreviousPage,
    canNextPage,
  } = useTable({
    columns,
    data,
    //filterTypes,
    initialState: { pageIndex: 0}
  }, 
    useGlobalFilter, 
    useSortBy,
    usePagination
    );

  // const handleFilterChange = e => {
  //   const value = e.target.value || undefined;
  //   setFilterInput(value);
  //   setGlobalFilter(value)
  // };

 
  const pageSizeOptions = [10, 20, 30, 40, 50]

  return (
    <div>
      {/* <SearchBar
        filterInput={filterInput}
        handleFilterChange={handleFilterChange}/> */}
      <Card className={classes.card}>
        <CardContent className={classes.content}>
          <CssBaseline/>
          {/* <PerfectScrollbar> */}
          <MaUTable {...getTableProps()}>
            <TableHead>
              {headerGroups.map(headerGroup => (
                <TableRow {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map(column => (
                    <TableCell {...column.getHeaderProps(column.getSortByToggleProps())}
                    className={
                      column.isSorted
                        ? column.isSortedDesc
                          ? "sort-desc"
                          : "sort-asc"
                        : ""
                    }
                    >{column.render("Header")}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableHead>
            <TableBody {...getTableBodyProps()}>
              {rows.map((row, i) => {
                prepareRow(row);
                return (
                  <TableRow {...row.getRowProps()}>
                    {row.cells.map(cell => {
                      return <TableCell {...cell.getCellProps()}>{cell.render("Cell")}</TableCell>;
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </MaUTable>
          {/* </PerfectScrollbar> */}
        <div align='center'>
          <Button startIcon={<ArrowPreviousIcon/>} size='small' className={classes.paginationButton} variant='contained' color='primary' onClick={() => previousPage()} disabled={!canPreviousPage}>
            Page
          </Button>
          <Button endIcon={<ArrowForwardIcon/>} size='small' className={classes.paginationButton} variant='contained' color='primary' onClick={() => nextPage()} disabled={!canNextPage}>
            Page
          </Button>
        <div>
          <Typography>
            Page: {pageIndex + 1} of {pageOptions.length}
          </Typography>
        </div>
        <TextField style={{marginTop: '1rem'}}
          select  
          variant='outlined' 
          margin='dense'
          onChange={e => {
            setPageSize(Number(e.target.value))
          }}  
          // eslint-disable-next-line react/jsx-sort-props
          SelectProps={{ native: true }}>
          {pageSizeOptions.map(option => (
            <option
              key={option}
              value={option}
            >
              {`${option} records per page`}
            </option>
          ))}
        </TextField>
        </div>
        </CardContent>
      </Card>
    </div>
  );
}

Results.propTypes = {
  className: PropTypes.string,
  orders: PropTypes.array
};

Results.defaultProps = {
  orders: []
};

export default Results;
