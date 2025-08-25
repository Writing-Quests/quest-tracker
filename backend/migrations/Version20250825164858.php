<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250825164858 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE feed_entry (
          id INT AUTO_INCREMENT NOT NULL,
          user_id INT NOT NULL,
          project_id INT DEFAULT NULL,
          code BINARY(16) NOT NULL COMMENT \'(DC2Type:ulid)\',
          created_at DATETIME NOT NULL,
          edited_at DATETIME NOT NULL,
          details JSON NOT NULL,
          update_type VARCHAR(255) NOT NULL,
          INDEX IDX_DEAECECCA76ED395 (user_id),
          INDEX IDX_DEAECECC166D1F9C (project_id),
          PRIMARY KEY(id)
        ) DEFAULT CHARACTER
        SET
          utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE interaction (
          id INT AUTO_INCREMENT NOT NULL,
          feed_entry_id_id INT NOT NULL,
          user_id INT NOT NULL,
          content VARCHAR(255) NOT NULL,
          INDEX IDX_378DFDA7EFD08CB2 (feed_entry_id_id),
          INDEX IDX_378DFDA7A76ED395 (user_id),
          PRIMARY KEY(id)
        ) DEFAULT CHARACTER
        SET
          utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE
          feed_entry
        ADD
          CONSTRAINT FK_DEAECECCA76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE
          feed_entry
        ADD
          CONSTRAINT FK_DEAECECC166D1F9C FOREIGN KEY (project_id) REFERENCES project (id)');
        $this->addSql('ALTER TABLE
          interaction
        ADD
          CONSTRAINT FK_378DFDA7EFD08CB2 FOREIGN KEY (feed_entry_id_id) REFERENCES feed_entry (id)');
        $this->addSql('ALTER TABLE
          interaction
        ADD
          CONSTRAINT FK_378DFDA7A76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE connection_user DROP FOREIGN KEY FK_4B83D173DD03F01');
        $this->addSql('ALTER TABLE connection_user DROP FOREIGN KEY FK_4B83D173A76ED395');
        $this->addSql('DROP TABLE connection_user');
        $this->addSql('ALTER TABLE
          connection
        ADD
          initiating_user_id INT NOT NULL,
        CHANGE
          created_at created_at DATETIME NOT NULL,
        CHANGE
          changed_at changed_at DATETIME DEFAULT NULL');
        $this->addSql('ALTER TABLE project CHANGE details details JSON DEFAULT NULL');
        $this->addSql('ALTER TABLE
          user
        CHANGE
          last_login_at last_activity_timestamp DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\'');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE connection_user (
          connection_id INT NOT NULL,
          user_id INT NOT NULL,
          INDEX IDX_4B83D173DD03F01 (connection_id),
          INDEX IDX_4B83D173A76ED395 (user_id),
          PRIMARY KEY(connection_id, user_id)
        ) DEFAULT CHARACTER
        SET
          utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB COMMENT = \'\'');
        $this->addSql('ALTER TABLE
          connection_user
        ADD
          CONSTRAINT FK_4B83D173DD03F01 FOREIGN KEY (connection_id) REFERENCES connection (id) ON
        UPDATE
          NO ACTION ON DELETE CASCADE');
        $this->addSql('ALTER TABLE
          connection_user
        ADD
          CONSTRAINT FK_4B83D173A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON
        UPDATE
          NO ACTION ON DELETE CASCADE');
        $this->addSql('ALTER TABLE feed_entry DROP FOREIGN KEY FK_DEAECECCA76ED395');
        $this->addSql('ALTER TABLE feed_entry DROP FOREIGN KEY FK_DEAECECC166D1F9C');
        $this->addSql('ALTER TABLE interaction DROP FOREIGN KEY FK_378DFDA7EFD08CB2');
        $this->addSql('ALTER TABLE interaction DROP FOREIGN KEY FK_378DFDA7A76ED395');
        $this->addSql('DROP TABLE feed_entry');
        $this->addSql('DROP TABLE interaction');
        $this->addSql('ALTER TABLE
          connection
        DROP
          initiating_user_id,
        CHANGE
          created_at created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
        CHANGE
          changed_at changed_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE project CHANGE details details JSON DEFAULT \'json_object()\'');
        $this->addSql('ALTER TABLE
          user
        CHANGE
          last_activity_timestamp last_login_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\'');
    }
}
