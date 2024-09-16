import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import { useEffect, useState, useRef } from "react";
import "primeicons/primeicons.css";
import { OverlayPanel } from "primereact/overlaypanel";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import "./App.css";

function App() {
  type Data = {
    title: string;
    place_of_origin: string;
    artist_display: string;
    inscriptions: string;
    date_start: number;
    date_end: number;
  };

  const [data, setData] = useState<Data[]>([]);
  const [pagination, setPagination] = useState<number>(1);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [selectedRows, setSelectedRows] = useState<Data[]>([]);
  const [value, setValue] = useState<string>("");

  useEffect(() => {
    getInfo();
  }, [pagination]);

  let API_URL: string = "https://api.artic.edu/api/v1/artworks?page";

  let getInfo = async () => {
    try {
      let response = await fetch(`${API_URL}=${pagination}`);
      let jsonResponse = await response.json();
      let apiDataInfo: Data[] = jsonResponse.data.map((info: any) => ({
        title: info.title,
        place_of_origin: info.place_of_origin,
        artist_display: info.artist_display,
        inscriptions: info.inscriptions,
        date_start: info.date_start,
        date_end: info.date_end,
      }));
      setData(apiDataInfo);
      setTotalRecords(jsonResponse.pagination.total);
    } catch (err) {
      console.log(err);
    }
  };

  const op = useRef<OverlayPanel>(null);

  const handleSelectRows = async () => {
    const selectNum = parseInt(value) || 0;
    if (selectNum > 0) {
      const rowsPerPage = 12;
      const totalPagesToCheck = Math.ceil(selectNum / rowsPerPage);
      let rowsToSelect: Data[] = [];
      let currPage = pagination;
      let fetchedPages: number[] = [];

      for (let i = 0; i < totalPagesToCheck; i++) {
        const pageToFetch = currPage + i;

        // Skip if the page has already been fetched
        if (fetchedPages.includes(pageToFetch)) {
          continue;
        }

        fetchedPages.push(pageToFetch);

        try {
          const response = await fetch(`${API_URL}=${pageToFetch}`);
          const jsonResponse = await response.json();
          const apiPageDataInfo: Data[] = jsonResponse.data.map(
            (info: any) => ({
              title: info.title,
              place_of_origin: info.place_of_origin,
              artist_display: info.artist_display,
              inscriptions: info.inscriptions,
              date_start: info.date_start,
              date_end: info.date_end,
            })
          );

          rowsToSelect = rowsToSelect.concat(apiPageDataInfo);

          // Stop fetching if we have enough rows
          if (rowsToSelect.length >= selectNum) break;
        } catch (err) {
          console.error("Error fetching data for page", pageToFetch, err);
        }
      }

      // Select the required number of rows
      setSelectedRows(rowsToSelect.slice(0, selectNum));
    }

    op.current?.hide();
  };

  const onPageChange = (event: any) => {
    setPagination(event.page + 1);
  };

  const titleHeader = (
    <div className="title-header">
      <i
        className="pi pi-angle-down"
        style={{ marginRight: "1rem", cursor: "pointer" }}
        onClick={(e) => op.current?.toggle(e)}
      ></i>
      <OverlayPanel ref={op} className="overlay-panel">
        <InputText
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Select rows.."
        />
        <br />
        <br />
        <Button
          label="Submit"
          onClick={handleSelectRows}
          severity="secondary"
          text
          style={{ border: "1px solid black" }}
        />
      </OverlayPanel>
      Title
    </div>
  );

  return (
    <>
      <div className="card">
        <DataTable
          value={data}
          paginator
          rows={12}
          totalRecords={totalRecords}
          lazy // load only one page
          first={(pagination - 1) * 12} // Keep track of the first record on the page
          onPage={onPageChange}
          selectionMode="multiple"
          selection={selectedRows}
          onSelectionChange={(e) => setSelectedRows(e.value)}
          tableStyle={{ minWidth: "50rem" }}
        >
          <Column
            selectionMode="multiple"
            headerStyle={{ width: "3rem" }}
          ></Column>
          <Column field="title" header={titleHeader}></Column>
          <Column field="place_of_origin" header="Place of origin"></Column>
          <Column field="artist_display" header="Artist display"></Column>
          <Column field="inscriptions" header="Inscriptions"></Column>
          <Column field="date_start" header="Date start"></Column>
          <Column field="date_end" header="Date end"></Column>
        </DataTable>
      </div>
    </>
  );
}

export default App;
