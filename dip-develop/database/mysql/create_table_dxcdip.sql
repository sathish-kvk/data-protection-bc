-- -----------------------------------------------------
-- Schema DIP
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `DIP` DEFAULT CHARACTER SET utf8 ;
USE `DIP` ;



CREATE TABLE IF NOT EXISTS `DIP`.`agreement` (
  `agreementID` VARCHAR(36) NOT NULL,
  `agreementName` VARCHAR(256) NULL,
  `agreementStatus` VARCHAR(36) NULL,
  `agreementHash` VARCHAR(256) NULL,
  `agreementChannelID` VARCHAR(45) NULL,
  `lastProofID` VARCHAR(36) NULL,
  PRIMARY KEY (`agreementID`),
  UNIQUE INDEX `agreementID_UNIQUE` (`agreementID` ASC))
ENGINE = InnoDB;


CREATE TABLE IF NOT EXISTS `DIP`.`element` (
  `elementID` VARCHAR(36) NOT NULL,
  `elementName` VARCHAR(256) NULL,
  `elementType` VARCHAR(36) NULL,
  `elementValue` VARCHAR(128) NULL,
  `writeOnce` TINYINT(1) NULL DEFAULT 1,
  `fk_agreementID` VARCHAR(36) NOT NULL,
  `element_parent_elementID` VARCHAR(45) NULL DEFAULT NULL,
  PRIMARY KEY (`elementID`),
  INDEX `fk_ agreementID_idx` (`fk_agreementID` ASC, `elementID` ASC),
  CONSTRAINT `fk_agreementID`
    FOREIGN KEY (`fk_agreementID` )
    REFERENCES `DIP`.`agreement` (`agreementID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `element_parent_elementID`
    FOREIGN KEY (`element_parent_elementID`)
    REFERENCES `DIP`.`element` (`elementID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;



CREATE TABLE IF NOT EXISTS `DIP`.`party` (
  `partyID` VARCHAR(36) NOT NULL,
  `partyName` VARCHAR(256) NULL,
  `partyRole` VARCHAR(36) NULL,
  `partyPublicKey` VARCHAR(36) NULL,
  PRIMARY KEY (`partyID`))
ENGINE = InnoDB;




CREATE TABLE IF NOT EXISTS `DIP`.`agreement_has_party` (
  `agreement_agreementID` VARCHAR(36) NOT NULL,
  `party_partyID` VARCHAR(36) NOT NULL,
  PRIMARY KEY (`agreement_agreementID`, `party_partyID`),
  INDEX `fk_agreement_has_party_party1_idx` (`party_partyID` ASC),
  INDEX `fk_agreement_has_party_agreement1_idx` (`agreement_agreementID` ASC),
  CONSTRAINT `fk_agreement_has_party_agreement1`
    FOREIGN KEY (`agreement_agreementID`)
    REFERENCES `DIP`.`agreement` (`agreementID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_agreement_has_party_party1`
    FOREIGN KEY (`party_partyID`)
    REFERENCES `DIP`.`party` (`partyID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;



CREATE TABLE IF NOT EXISTS `DIP`.`rule` (
  `ruleID` VARCHAR(45) NOT NULL,
  `ruleType` VARCHAR(45) NULL,
  `ruleText` VARCHAR(256) NULL,
  `fk_ElementID` VARCHAR(45) NULL,
  PRIMARY KEY (`ruleID`),
  CONSTRAINT `elementElementID`
    FOREIGN KEY (`fk_ElementID`)
    REFERENCES `DIP`.`element` (`elementID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;



CREATE TABLE IF NOT EXISTS `DIP`.`proof` (
  `proofID` VARCHAR(45) NOT NULL,
  `fk_agreementID` VARCHAR(45) NULL,
  `fk_elementID` VARCHAR(45) NULL,
  `proofBeforeHash` VARCHAR(1024) NULL,
  `proofAfterHash` VARCHAR(1024) NULL,
  `proofConsensus` TINYINT(1) NULL,
  `proof_HL_transactionID` VARCHAR(256) NULL,
  PRIMARY KEY (`proofID`),
  INDEX ` fk_elementID _idx` (`fk_elementID` ASC),
  INDEX ` fk_agreementID _idx` (`fk_agreementID` ASC),
  CONSTRAINT ` fk_agreementID `
    FOREIGN KEY (`fk_agreementID`)
    REFERENCES `DIP`.`agreement` (`agreementID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT ` fk_elementID `
    FOREIGN KEY (`fk_elementID`)
    REFERENCES `DIP`.`element` (`elementID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;



CREATE TABLE IF NOT EXISTS `DIP`.`assent` (
  `fk_proofID` VARCHAR(45) NOT NULL,
  `fk_partyID` VARCHAR(45) NOT NULL,
  `assent_signedHash` VARCHAR(1024) NULL,
  PRIMARY KEY (`fk_proofID`,`fk_partyID`),
  INDEX `fk_partyID_idx` (`fk_partyID` ASC),
  CONSTRAINT `fk_proofID`
    FOREIGN KEY (`fk_proofID`)
    REFERENCES `DIP`.`proof` (`proofID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_partyID`
    FOREIGN KEY (`fk_partyID`)
    REFERENCES `DIP`.`party` (`partyID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


CREATE  TABLE `DIP`.`documentHash` (
  `documentHashID` VARCHAR(256) NOT NULL ,
  `documentContent` MEDIUMTEXT NULL ,
  PRIMARY KEY (`documentHashID`))
ENGINE = InnoDB;


CREATE  TABLE `DIP`.`document` (
  `documentID`  VARCHAR(45) NOT NULL,
  `agreementID` VARCHAR(45) NULL ,
  `elementID` VARCHAR(45) NULL ,
  `documentHashID` VARCHAR(256) NOT NULL ,
  `documentName` VARCHAR(256) NULL ,
  `documentType` VARCHAR(125) NULL , 
  `createdDate` DATETIME,
  PRIMARY KEY (`documentID`) ,
  INDEX `fk_agreementID_idx` (`agreementID` ASC) ,
  INDEX `fk_elementID_idx` (`elementID` ASC) ,
  INDEX `fk_documentHashID_idx` (`documentHashID` ASC) ,
  CONSTRAINT `fk_agreementID_document`
    FOREIGN KEY (`agreementID` )
    REFERENCES `DIP`.`agreement` (`agreementID` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_elementID_document`
    FOREIGN KEY (`elementID` )
    REFERENCES `DIP`.`element` (`elementID` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_documentHashID_document`
    FOREIGN KEY (`documentHashID` )
    REFERENCES `DIP`.`documentHash` (`documentHashID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;