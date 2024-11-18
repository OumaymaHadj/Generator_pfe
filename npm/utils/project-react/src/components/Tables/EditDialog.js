import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, VStack, FormControl, FormLabel } from "@chakra-ui/react"; 
import { useState, useEffect } from 'react';
import React from "react";


export default function EditDialog({ title, fileds, primaryKey, isAutoIncrement, isOpen, onClose, rowData, onSave }) {
  
  const fieldsForAdd = fileds ? fileds.filter(field => field !== '') : null;

  const [editedData, setEditedData] = useState(() => {
    if (rowData) {
      return { ...rowData }; 
    } else {
      
      return fieldsForAdd.reduce((acc, field) => {
        acc[field] = ''; 
        return acc;
      }, {});
    }
  });

  useEffect(() => {
    if (rowData) {
      setEditedData({ ...rowData });
    } else {
      const initialData = fieldsForAdd.reduce((acc, field) => {
        acc[field] = ''; 
        return acc;
      }, {});
      setEditedData(initialData);
    }
  }, [rowData, fileds]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData({ ...editedData, [name]: value }); 
  };

  const handleSave = async () => {
    onSave(editedData);
    onClose(); 
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalBody>
        <VStack spacing={4}>
            {/* Dynamically generate input fields based on editedData or fileds */}
            {(editedData && Object.keys(editedData).length > 0 ? Object.keys(editedData) : fieldsForAdd).map((key) => (
              // Conditionally render inputs excluding the primary key if it's auto-incremented
              !(key === primaryKey && isAutoIncrement) && (
                <FormControl key={key}>
                  <FormLabel>{key.charAt(0).toUpperCase() + key.slice(1)}</FormLabel>
                  <Input
                    name={key}
                    value={editedData[key] || ''} 
                    onChange={handleInputChange} 
                    placeholder={key}
                  />
                </FormControl>
              )
            ))}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button onClick={handleSave}>Save</Button>
          <Button onClick={onClose} ml={3}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}