import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { Checkbox } from 'primereact/checkbox';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { FaKey, FaKeycdn } from 'react-icons/fa'; // Importation des icônes depuis react-icons
import { FaExclamationTriangle } from 'react-icons/fa';

const TablesModal = ({
  showModal,
  handleClose,
  combinedData,
  areAllTablesSelected,
  selectAll,
  isTableSelected,
  onSelectTable,
  handleSubmitComponent,
  database
}) => {
  const [showWarning, setShowWarning] = useState(false); // State to control warning popup
  // Handle save logic and check if there's any selected table without a primary key
  const handleSave = () => {
    // Grouper les données par tableName
    const tablesGroupedByTableName = combinedData.reduce((acc, item) => {
      if (!acc[item.tableName]) {
        acc[item.tableName] = [];
      }
      acc[item.tableName].push(item);
      return acc;
    }, {});
    // Vérifier si une table sélectionnée n'a pas de champ pk
    const hasMissingPk = Object.keys(tablesGroupedByTableName).some((tableName) => {
      if (isTableSelected(tableName)) {
        const tableFields = tablesGroupedByTableName[tableName];
        // Vérifier si un champ 'pk' est présent dans les données de la table
        return !tableFields.some((field) => field.pk);
      }
      return false;
    });


    // Si une table sélectionnée n'a pas de 'pk', montrer un avertissement
    if (hasMissingPk && database !== 'mongoDB') {
      setShowWarning(true); // Afficher l'avertissement si un champ 'pk' est manquant
    } else {
      handleSubmitComponent(); // Procéder à la sauvegarde si toutes les tables sélectionnées ont un champ 'pk'
    }
  };


  return (
    <>
      <Modal
        show={showModal}
        onHide={handleClose}
        centered
        size='lg'
      >
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: '30px' }}>
            Select the tables for which you want to generate components in the project
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <DataTable value={combinedData} tableStyle={{ minWidth: '50rem' }}>
              <Column
                field="tableName"
                header={
                  <>
                    <Checkbox
                      checked={areAllTablesSelected()}
                      onChange={selectAll}
                    />
                    <span className="font-bold">Table Name</span>
                  </>
                }
                headerStyle={{ width: '30rem', fontSize: '18px', textAlign: 'center' }}
                bodyStyle={{ fontSize: '14px', textAlign: 'center' }}
                body={(rowData, { rowIndex }) => {
                  const isFirst = rowIndex === 0 || combinedData[rowIndex - 1].tableName !== rowData.tableName;
                  return (
                    <div className="flex align-items-center gap-2">
                      {isFirst && (
                        <Checkbox
                          checked={isTableSelected(rowData.tableName)}
                          onChange={(e) => onSelectTable(e, rowData.tableName)}
                        />
                      )}
                      <span className={isFirst ? "font-bold" : "font-bold invisible"}>{rowData.tableName}</span>
                    </div>
                  );
                }}
                style={{ width: '30rem', fontSize: '14px' }}
              />
              <Column
                field="field"
                header="Field"
                style={{ minWidth: '200px' }}
                headerStyle={{ width: '30rem', fontSize: '18px' }}
                bodyStyle={{ fontSize: '14px' }}
                body={(rowData) => (
                  <div className="flex align-items-center gap-2">
                    <span>{rowData.field}</span>
                    {rowData.pk && <FaKey style={{ marginLeft: '10px', color: 'yellow' }} />} {/* Icon for primary key */}
                    {rowData.fk && <FaKey style={{ marginLeft: '10px', color: 'gray' }} />} {/* Icon for foreign key */}
                  </div>
                )}
              />
              <Column
                field="type"
                header="Type"
                style={{ minWidth: '150px' }}
                headerStyle={{ width: '30rem', fontSize: '18px' }}
                bodyStyle={{ fontSize: '14px' }}
              />
            </DataTable>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <div className="button-container">
            <button className="btn btn_cta -sm" type="submit" onClick={handleClose}>
              <span className="btn_cta-border"></span>
              <span className="btn_cta-ripple">
                <span></span>
              </span>
              <span className="btn_cta-title">
                <span data-text="Close">Close</span>
              </span>
            </button>
            <button className="btn btn_cta -sm btn-save" onClick={handleSave}>
              <span className="btn_cta-border"></span>
              <span className="btn_cta-ripple">
                <span></span>
              </span>
              <span className="btn_cta-title">
                <span data-text="Save">Save</span>
              </span>
            </button>
          </div>
        </Modal.Footer>
      </Modal>

      {/* Blocking modal when primary key is missing */}
      <Modal show={showWarning} onHide={() => setShowWarning(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontWeight: 'bold' }}>      <FaExclamationTriangle style={{ color: 'orange', marginRight: '10px' }} />
            Primary Key Missing</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p style={{ fontSize: '14px' }}>
            One or more tables do not have a primary key. Please ensure that every selected table has a primary key before proceeding.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <div className="button-container">
            <button variant="secondary" onClick={() => setShowWarning(false)} className="btn btn_cta -xsm" type="submit">
              <span className="btn_cta-border"></span>
              <span className="btn_cta-ripple">
                <span></span>
              </span>
              <span className="btn_cta-title">
                <span data-text="Close">Close</span>
              </span>
            </button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default TablesModal;


/*


// TablesModal.jsx
import React from 'react';
import { Modal } from 'react-bootstrap';
import { Checkbox } from 'primereact/checkbox';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { FaKey, FaKeycdn } from 'react-icons/fa'; // Importation des icônes depuis react-icons

const TablesModal = ({
  showModal,
  handleClose,
  combinedData,
  areAllTablesSelected,
  selectAll,
  isTableSelected,
  onSelectTable,
  handleSubmitComponent,
}) => {
  return (
    <Modal
      show={showModal}
      onHide={handleClose}
      centered
      size='lg'
    >
      <Modal.Header closeButton>
        <Modal.Title style={{ fontSize: '30px' }}>
          Select the tables for which you want to generate components in the project
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <DataTable value={combinedData} tableStyle={{ minWidth: '50rem' }}>
          <Column
            field="tableName"
            header={
              <>
                <Checkbox
                  checked={areAllTablesSelected()}
                  onChange={selectAll}
                />
                <span className="font-bold">Table Name</span>
              </>
            }
            headerStyle={{ width: '30rem', fontSize: '18px', textAlign: 'center' }}
            bodyStyle={{ fontSize: '14px', textAlign: 'center' }}
            body={(rowData, { rowIndex }) => {
              const isFirst = rowIndex === 0 || combinedData[rowIndex - 1].tableName !== rowData.tableName;
              return (
                <div className="flex align-items-center gap-2">
                  {isFirst && (
                    <Checkbox
                      checked={isTableSelected(rowData.tableName)}
                      onChange={(e) => onSelectTable(e, rowData.tableName)}
                    />
                  )}
                  <span className={isFirst ? "font-bold" : "font-bold invisible"}>{rowData.tableName}</span>
                </div>
              );
            }}
            style={{ width: '30rem', fontSize: '14px' }}
          />
          <Column
            field="field"
            header="Field"
            style={{ minWidth: '200px' }}
            headerStyle={{ width: '30rem', fontSize: '18px' }}
            bodyStyle={{ fontSize: '14px' }}
            body={(rowData) => (
              <div className="flex align-items-center gap-2">
                <span>{rowData.field}</span>
                {rowData.pk && <FaKey style={{ marginLeft: '10px', color: 'yellow' }} />} 
                {rowData.fk && <FaKey style={{ marginLeft: '10px', color: 'gray' }} />} 
              </div>
            )}
          />
          <Column
            field="type"
            header="Type"
            style={{ minWidth: '150px' }}
            headerStyle={{ width: '30rem', fontSize: '18px' }}
            bodyStyle={{ fontSize: '14px' }}
          />
        </DataTable>
      </Modal.Body>
      <Modal.Footer>
        <div className="button-container">
          <button className="btn btn_cta -sm" type="submit" onClick={handleClose}>
            <span className="btn_cta-border"></span>
            <span className="btn_cta-ripple">
              <span></span>
            </span>
            <span className="btn_cta-title">
              <span data-text="Close">Close</span>
            </span>
          </button>
          <button className="btn btn_cta -sm btn-save" onClick={handleSubmitComponent}>
            <span className="btn_cta-border"></span>
            <span className="btn_cta-ripple">
              <span></span>
            </span>
            <span className="btn_cta-title">
              <span data-text="Save">Save</span>
            </span>
          </button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default TablesModal;


*/