import { Paper, Skeleton, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { useEffect, useState } from 'react';
import { Button, Col, Form, FormControl, InputGroup, Row } from 'react-bootstrap';
import { BsSearch, BsSkipEnd, BsSkipStart } from 'react-icons/bs';
import './DataTable.scss'
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import { FaRegCircleStop } from 'react-icons/fa6';
import { RiPencilFill } from 'react-icons/ri';

const DataTable = (props) => {
  const { data, title, hiddenColumnList, handleView, switchChange } = props
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1); // Reset to the first page
  };

  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  const filterData = () => {
    const results = data.filter((row) => {
      const status = row.status?.toString().toLowerCase();
      const mappedStatus = ['active', 'registered', 'verified'].includes(status)
        ? 'active'
        : ['disabled', 'inactive'].includes(status)
          ? 'inactive'
          : '';

      const modifiedRow = {
        ...row,
        status: mappedStatus, // this is used in search matching
      };

      const rowString = Object.values(modifiedRow)
        .map((value) => (value ? value.toString().toLowerCase() : "null"))
        .join(" ");

      const searchTerms = searchTerm.toLocaleLowerCase().split(" ");

      if (searchTerms.includes("active")) {
        return mappedStatus === "active";
      }
      if (searchTerms.includes("inactive")) {
        return mappedStatus === "inactive";
      }
      if (searchTerms.some(term => status?.includes(term))) {
        return true;
      }

      return searchTerms.every((term) => rowString.includes(term));
    });

    setFilteredData(results);
    setCurrentPage(1);
  };

  useEffect(() => {
    filterData();
  }, [searchTerm]);

  const reduceName = (text, charLimit) => {
    if (!text) return { truncated: "", isTruncated: false };
    if (text.length > charLimit) {
      return {
        truncated: text.slice(0, charLimit) + "...",
        isTruncated: true,
      };
    }
    return {
      truncated: text,
      isTruncated: false,
    };
  }
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);

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
          className={`pagination-button ${currentPage === i ? "active" : ""}`}
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
          className={`pagination-button ${currentPage === totalPages ? "active" : ""
            }`}
        >
          {totalPages}
        </button>
      );
    }

    return buttons;
  };
 const handleToggleStatus = (rowId) => {
  const temp = filteredData.filter((row) => row.id === rowId);
  if (!temp.length) return;
  const updateRecord = temp[0]; // Get the actual object
  const currentStatus = updateRecord.status?.toLowerCase();
  const newStatus =
    currentStatus === "verified" ||
    currentStatus === "active" ||
    currentStatus === "registered"
      ? "Inactive"
      : "Verified";
  const updatedRecord = { ...updateRecord, status: newStatus };
  switchChange({
    id: rowId,
    status: newStatus,
    updateRecord: updatedRecord,
  });
};

  


  const columns = [
    {
      key: 'sl_no',
      label: 'Sl. No.',
      render: (_row, rowIndex) => (currentPage - 1) * pageSize + rowIndex + 1,
    },
    ...(data.length > 0
      ? Object.keys(data[0])
        .filter((key) => !hiddenColumnList.includes(key))
        .map((key) => ({
          key,
          label: key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        }))
      : []),
    {
      key: 'action',
      label: 'Action',
      render: (row) => (
        <div className="d-flex  align-items-center">
          <RiPencilFill color="#525354" style={{ cursor: 'pointer' }} onClick={() => handleView('form', row)} />
          <Switch
            size='small'
            checked={['active','registered','verified'].includes(row.status?.toLowerCase())}
            onChange={() => handleToggleStatus(row.id)}
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': {
                color: '#FF0087',
              },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                backgroundColor: '#FF0087',
              },
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <div className='d-flex justify-content-center align-items-center flex-column'>
        <div style={{ width: "90%" }}>
          <div className='mt-5 mb-3'>
            <div className='horizantal-line' />
            <p className='heading1 mb-1 mt-1'>{title}</p>
            <div className='horizantal-line' />
          </div>
          <Row className="align-items-center mb-2 mt-4">
            <Col>
              <div className="search-input-container">
                <FormControl placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input-padding"
                />
                <BsSearch className="search-input-icon" size={20} />
              </div>
            </Col>
            <Col xs="auto" className="pe-0">
              <Button className="AddButton pe-4 ps-4" onClick={() => handleView("form")}>
                +Add
              </Button>
            </Col>
          </Row>
          {/* {isLoading && <Skeleton />} */}
          {paginatedData.length > 0 ? (
            <div>
              <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
                <Table size='medium' sx={{ boxShadow: "none" }}  >
                  <TableHead>
                    <TableRow sx={{ borderBottom: '2px  solid #999999' }}  >
                      {columns.map((column, index) => (
                        <TableCell key={index}><strong>{column.label}</strong></TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedData.map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {columns.map((col, colIndex) => {
                          if (col.key === 'sl_no') {
                            return (
                              <TableCell key={colIndex}> {(currentPage - 1) * pageSize + rowIndex + 1}</TableCell>
                            );
                          }
                          if (col.key === 'status') {
                            const lowerStatus=row[col.key]?.toLowerCase();
                            const statusLabel=['active','registered','verified'].includes(lowerStatus)?'button-active':'button-inactive'
                            return (
                              <TableCell key={colIndex}>
                                <label
                                  className={statusLabel}
                                  title={row[col.key]} // Tooltip on hover
                                >
                                  <FaRegCircleStop />
                                </label>
                              </TableCell>
                            );
                          }

                          if (col.render) {
                            return (
                              <TableCell key={colIndex}>{col.render(row, rowIndex)}</TableCell>
                            );
                          }
                          return (
                            <TableCell key={colIndex}>
                              {typeof row[col.key] === 'number'
                                ? (Number.isInteger(row[col.key]) ? row[col.key] : row[col.key].toFixed(2))
                                : reduceName(row[col.key], 40).truncated}
                            </TableCell>
                          );
                        })}

                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Row className="align-items-center justify-content-between mt-4 mb-4">
                {/* Left: Page size selector and info */}
                <Col md="6" className="d-flex align-items-center gap-3">
                  <Form.Select
                    value={pageSize}
                    onChange={handlePageSizeChange}
                    style={{ width: '70px', height: "34px", backgroundColor: '#FF0087', color: 'white', border: 'none', boxShadow: 'none' }}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </Form.Select>
                  <span className="text-nowrap">
                    Showing rows {Math.min((currentPage - 1) * pageSize + 1, filteredData.length)} to{" "}
                    {Math.min(currentPage * pageSize, filteredData.length)} out of {filteredData.length}
                  </span>
                </Col>

                {/* Right: Pagination buttons */}
                <Col md="6" className="d-flex justify-content-end flex-wrap gap-2 mt-3 mt-md-0">
                  <button className="pagination-button" onClick={goToFirstPage} disabled={currentPage === 1}>
                    <BsSkipStart />
                  </button>
                  <button className="button-next-prev" onClick={handlePrev} disabled={currentPage === 1}>
                    <MdArrowBackIos /> Prev
                  </button>
                  <div className="d-flex gap-2 flex-wrap">{renderPagination()}</div>
                  <button className="button-next-prev" onClick={handleNext} disabled={currentPage === totalPages}>
                    Next <MdArrowForwardIos />
                  </button>
                  <button className="pagination-button" onClick={goToLastPage} disabled={currentPage === totalPages}>
                    <BsSkipEnd />
                  </button>
                </Col>
              </Row>
            </div>
          ) : <p className="text-center mt-4">No data available.</p>}
        </div>

      </div>

    </>
  )
}

export default DataTable

