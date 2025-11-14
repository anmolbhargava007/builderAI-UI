import React, { useState } from 'react';
import { BsSkipStart, BsSkipEnd } from 'react-icons/bs';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import './TransactionTable.scss';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography  } from '@mui/material';
import { Button } from 'react-bootstrap';


const TransactionTable = ({ TransactionData }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const totalPages = Math.ceil(TransactionData.length / rowsPerPage);
  const paginatedData = TransactionData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const handleNext = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const handlePrev = () => currentPage > 1 && setCurrentPage(currentPage - 1);

  const renderPagination = () => {
		const buttons = [];
		let startPage, endPage;

		if (totalPages <= 7) {
			startPage = 1;
			endPage = totalPages;
		} else {
			if (currentPage <= 4) {
				startPage = 1;
				endPage = 5;
			} else if (currentPage >= totalPages - 3) {
				startPage = totalPages - 4;
				endPage = totalPages;
			} else {
				startPage = currentPage - 2;
				endPage = currentPage + 2;
			}
		}

		for (let i = startPage; i <= endPage; i++) {
			buttons.push(
				<button
					key={i}
					onClick={() => setCurrentPage(i)}
					size="sm"
					className={`btn btn-outline-primary pagination-button ${currentPage === i ? "active" : ""}`}
				>
					{i}
				</button>
			);
		}

		if (endPage < totalPages) {
			buttons.push(
				<button key="ellipsis" variant="outline" size="sm" disabled>
					...
				</button>
			);
			buttons.push(
				<button
					key={totalPages}
					onClick={() => setCurrentPage(totalPages)}
					size="sm"
					className={`pagination-button ${
						currentPage === totalPages ? "active" : ""
					}`}
				>
					{totalPages}
				</button>
			);
		}

		return buttons;
	};


  const reduceName = (text, charLimit) => {
    if (!text) return { truncated: '', isTruncated: false };
    if (text.length > charLimit) {
      return { truncated: text.slice(0, charLimit) + '...', isTruncated: true };
    }
    return { truncated: text, isTruncated: false };
  };

  const hideColumn = ['id', 'userid', 'compid','prompt_tokens','completion_tokens','total_tokens','workflowrunid','created_by','updated_at','updated_by'];
  const columns = Object.keys(TransactionData[0] || {}).filter((key) => !hideColumn.includes(key));
  const formatColumnName = (column) =>
    column.split('_').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return (
    <div  className="table-scroll-wrapper">
      {TransactionData.length > 0 ? (
        <TableContainer component={Paper} sx={{ boxShadow:"none" }}>
          <Table size="medium"sx={{ boxShadow:"none" }}>
            <TableHead>
              <TableRow sx={{borderBottom: '2px  solid #999999'}}>
                {columns.map((column, index) => (
                  <TableCell key={index}>
                    <strong>{formatColumnName(column)}</strong>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((row, index) => (
                <TableRow key={index}>
                  {columns.map((column, i) => (
                    <TableCell key={i}>
                      {column === 'date'
                        ? new Date(row[column].replace(/\./g, '/')).toLocaleDateString()
                        : column === 'balance'
                        ? parseFloat(row[column]).toFixed(2)
                        : reduceName(row[column], 40).truncated}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography align="center" mt={2}>
          No data available for the selected date range
        </Typography>
      )}

      <div className=" d-flex justify-content-center align-items-center my-4 gap-2">
            <button className="pagination-button" onClick={goToFirstPage} disabled={currentPage === 1}>
              <BsSkipStart />
            </button>
            <button  className="button-next-prev"onClick={handlePrev} disabled={currentPage === 1}>
              <MdArrowBackIos /> Prev
            </button>
          <div className="d-flex gap-2">{renderPagination()}</div>

            <button className="button-next-prev" onClick={handleNext} disabled={currentPage === totalPages}>
              Next <MdArrowForwardIos />
            </button>
            <button className="pagination-button" onClick={goToLastPage} disabled={currentPage === totalPages}>
              <BsSkipEnd />
            </button>
      </div>
    </div>
  );
};

export default TransactionTable;
