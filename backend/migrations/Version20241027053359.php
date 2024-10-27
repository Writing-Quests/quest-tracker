<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20241027053359 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE
          login_token
        CHANGE
          id id BINARY(16) DEFAULT (UUID_TO_BIN(UUID())) NOT NULL COMMENT \'(DC2Type:uuid)\',
        CHANGE
          user_id user_id BINARY(16) DEFAULT (UUID_TO_BIN(UUID())) NOT NULL COMMENT \'(DC2Type:uuid)\'');
        $this->addSql('ALTER TABLE
          project
        CHANGE
          id id BINARY(16) DEFAULT (UUID_TO_BIN(UUID())) NOT NULL COMMENT \'(DC2Type:uuid)\',
        CHANGE
          user_id user_id BINARY(16) DEFAULT (UUID_TO_BIN(UUID())) NOT NULL COMMENT \'(DC2Type:uuid)\'');
        $this->addSql('ALTER TABLE
          project_goal
        CHANGE
          id id BINARY(16) DEFAULT (UUID_TO_BIN(UUID())) NOT NULL COMMENT \'(DC2Type:uuid)\',
        CHANGE
          project_id project_id BINARY(16) DEFAULT (UUID_TO_BIN(UUID())) NOT NULL COMMENT \'(DC2Type:uuid)\'');
        $this->addSql('ALTER TABLE
          user
        CHANGE
          id id BINARY(16) DEFAULT (UUID_TO_BIN(UUID())) NOT NULL COMMENT \'(DC2Type:uuid)\'');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE
          project_goal
        CHANGE
          id id BINARY(16) NOT NULL COMMENT \'(DC2Type:uuid)\',
        CHANGE
          project_id project_id BINARY(16) NOT NULL COMMENT \'(DC2Type:uuid)\'');
        $this->addSql('ALTER TABLE
          project
        CHANGE
          id id BINARY(16) NOT NULL COMMENT \'(DC2Type:uuid)\',
        CHANGE
          user_id user_id BINARY(16) NOT NULL COMMENT \'(DC2Type:uuid)\'');
        $this->addSql('ALTER TABLE
          login_token
        CHANGE
          id id BINARY(16) NOT NULL COMMENT \'(DC2Type:uuid)\',
        CHANGE
          user_id user_id BINARY(16) NOT NULL COMMENT \'(DC2Type:uuid)\'');
        $this->addSql('ALTER TABLE user CHANGE id id BINARY(16) NOT NULL COMMENT \'(DC2Type:uuid)\'');
    }
}
