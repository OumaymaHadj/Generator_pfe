import { AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay, Button, Flex, Td, Text, Tr, useColorModeValue } from "@chakra-ui/react";
import { useState, useRef } from 'react';
import React from "react";
import EditDialog from "./EditDialog"

export default function TablesTableRow({ row, primaryKey, isAutoIncrement, update, onDelete }) {

  const textColor = useColorModeValue("gray.700", "white");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(null);
  const cancelRef = useRef();

  const onEdit = (row) => {
    setSelectedRow(row);
    setIsDialogOpen(true);
  };

  const confirmDelete = (row) => {
    setSelectedRow(row);
    setIsConfirmDialogOpen(true);
  };

  const onClose = () => {
    setIsDialogOpen(false); 
    setIsConfirmDialogOpen(false);
    setSelectedRow(null); 
  };

  const handleSave = (updatedRow) => {
    update(updatedRow); 
    onClose()
  };

  const handleDelete = () => {
    onDelete(selectedRow);
    onClose()
  };

  return (
    <>
    <Tr>

      {/* Render each field dynamically */}
      {Object.entries(row).map(([key, value]) => (
        <Td key={key} minWidth={{ sm: "150px" }} pl="0px">
          <Flex direction="column">
            <Text
              fontSize="md"
              color={textColor}
              fontWeight="bold"
              minWidth="100%"
            >
              {value}
            </Text>
          </Flex>
        </Td>
      ))}

      <Td>
        <Button p="0px" bg="transparent" variant="no-hover" onClick={() => onEdit(row)}>
          <Text
            fontSize="md"
            color="gray.400"
            fontWeight="bold"
            cursor="pointer"
            _hover={{ color: "teal.300" }}
          >
            Edit
          </Text>
        </Button>
      </Td>
      <Td>
        <Button p="0px" bg="transparent" variant="no-hover"  onClick={() => confirmDelete(row)}>
          <Text
            fontSize="md"
            color="gray.400"
            fontWeight="bold"
            cursor="pointer"
            _hover={{ color: "red.500" }}
          >
            Delete
          </Text>
        </Button>
      </Td>
    </Tr>

    {isDialogOpen && (
      <EditDialog
        title={'Edit'}
        primaryKey={primaryKey}
        isAutoIncrement={isAutoIncrement}
        isOpen={isDialogOpen}
        onClose={onClose}
        rowData={selectedRow}
        onSave={handleSave}
      />
    )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isConfirmDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsConfirmDialogOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Confirm Delete
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this row? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsConfirmDialogOpen(false)}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

    </>
  );
}
