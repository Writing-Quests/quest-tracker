<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251011202551 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE TABLE direct_message (id INT AUTO_INCREMENT NOT NULL, message_thread_id INT NOT NULL, to_user_id INT NOT NULL, from_user_id INT NOT NULL, content LONGTEXT NOT NULL, seen_at DATETIME DEFAULT NULL COMMENT '(DC2Type:datetime_immutable)', sent_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)', INDEX IDX_1416AF938829462F (message_thread_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE group_message (id INT AUTO_INCREMENT NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE message_thread (id INT AUTO_INCREMENT NOT NULL, report_id INT DEFAULT NULL, code BINARY(16) NOT NULL COMMENT '(DC2Type:ulid)', sender_user_id INT NOT NULL, receiving_user_id INT NOT NULL, in_recipient_inbox TINYINT(1) NOT NULL, in_sender_inbox TINYINT(1) NOT NULL, subject VARCHAR(255) NOT NULL, UNIQUE INDEX UNIQ_607D18C4BD2A4C0 (report_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE notification (id INT AUTO_INCREMENT NOT NULL, user_id INT DEFAULT NULL, created_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)', content VARCHAR(255) NOT NULL, user_read TINYINT(1) NOT NULL, notification_link VARCHAR(255) DEFAULT NULL, read_at DATETIME DEFAULT NULL COMMENT '(DC2Type:datetime_immutable)', INDEX IDX_BF5476CAA76ED395 (user_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE progress_entry (id INT AUTO_INCREMENT NOT NULL, project_id INT NOT NULL, created_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)', entry_date DATETIME NOT NULL, value NUMERIC(12, 2) NOT NULL, type VARCHAR(255) NOT NULL, units VARCHAR(255) NOT NULL, INDEX IDX_C9996E4B166D1F9C (project_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE direct_message ADD CONSTRAINT FK_1416AF938829462F FOREIGN KEY (message_thread_id) REFERENCES message_thread (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE message_thread ADD CONSTRAINT FK_607D18C4BD2A4C0 FOREIGN KEY (report_id) REFERENCES report (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE notification ADD CONSTRAINT FK_BF5476CAA76ED395 FOREIGN KEY (user_id) REFERENCES user (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE progress_entry ADD CONSTRAINT FK_C9996E4B166D1F9C FOREIGN KEY (project_id) REFERENCES project (id)
        SQL);
        /*
        this column does not exist in the database
        $this->addSql(<<<'SQL'
            ALTER TABLE report DROP review_notes
        SQL);
        */
        $this->addSql(<<<'SQL'
            ALTER TABLE user ADD allow_dms TINYINT(1) NOT NULL, ADD send_email_notifications TINYINT(1) NOT NULL
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE direct_message DROP FOREIGN KEY FK_1416AF938829462F
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE message_thread DROP FOREIGN KEY FK_607D18C4BD2A4C0
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE notification DROP FOREIGN KEY FK_BF5476CAA76ED395
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE progress_entry DROP FOREIGN KEY FK_C9996E4B166D1F9C
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE direct_message
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE group_message
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE message_thread
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE notification
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE progress_entry
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE user DROP allow_dms, DROP send_email_notifications
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE report ADD review_notes VARCHAR(255) DEFAULT NULL
        SQL);
    }
}
